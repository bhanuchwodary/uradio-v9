import { useEffect, useRef, useCallback } from "react";
import { globalAudioRef, updateGlobalPlaybackState, resetAudioStateForUserAction } from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger";
import { App } from '@capacitor/app';

interface UseEnhancedPhoneCallHandlingProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  currentTrack: any;
  onStreamRecovery: () => void;
}

export const useEnhancedPhoneCallHandling = ({
  isPlaying,
  setIsPlaying,
  currentTrack,
  onStreamRecovery
}: UseEnhancedPhoneCallHandlingProps) => {
  const interruptionTypeRef = useRef<'none' | 'call' | 'background' | 'audio-focus' | 'network'>('none');
  const wasPlayingBeforeInterruptionRef = useRef<boolean>(false);
  const interruptionTimeRef = useRef<number>(0);
  const recoveryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextStateCheckRef = useRef<NodeJS.Timeout | null>(null);

  const setInterruptionState = useCallback((type: 'none' | 'call' | 'background' | 'audio-focus' | 'network', wasPlaying: boolean = false) => {
    interruptionTypeRef.current = type;
    wasPlayingBeforeInterruptionRef.current = wasPlaying;
    interruptionTimeRef.current = Date.now();
    
    logger.debug("Interruption state changed", {
      type,
      wasPlaying,
      timestamp: interruptionTimeRef.current
    });
  }, []);

  const clearInterruptionState = useCallback(() => {
    interruptionTypeRef.current = 'none';
    wasPlayingBeforeInterruptionRef.current = false;
    interruptionTimeRef.current = 0;
    
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = null;
    }
    
    logger.debug("Interruption state cleared");
  }, []);

  const attemptPlaybackRecovery = useCallback(async (source: string) => {
    const audio = globalAudioRef.element;
    if (!audio || !currentTrack) return false;

    logger.info(`Attempting playback recovery from ${source}`, {
      interruptionType: interruptionTypeRef.current,
      wasPlayingBefore: wasPlayingBeforeInterruptionRef.current,
      timeSinceInterruption: Date.now() - interruptionTimeRef.current
    });

    // Check if we should attempt recovery
    if (!wasPlayingBeforeInterruptionRef.current) {
      logger.debug("Not recovering - wasn't playing before interruption");
      return false;
    }

    // For longer interruptions, try stream recovery first
    const interruptionDuration = Date.now() - interruptionTimeRef.current;
    if (interruptionDuration > 30000) { // 30 seconds
      logger.info("Long interruption detected, triggering stream recovery");
      onStreamRecovery();
      return true;
    }

    try {
      // First, check if the stream is still valid
      if (audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE ||
          audio.networkState === HTMLMediaElement.NETWORK_EMPTY) {
        logger.debug("Network state indicates stream needs recovery");
        onStreamRecovery();
        return true;
      }

      // Try to resume playback
      await audio.play();
      setIsPlaying(true);
      resetAudioStateForUserAction();
      clearInterruptionState();
      
      logger.info(`Playback recovered successfully from ${source}`);
      return true;
    } catch (error) {
      logger.error(`Failed to recover playback from ${source}:`, error);
      
      // If direct recovery fails, try stream recovery
      setTimeout(() => {
        onStreamRecovery();
      }, 1000);
      
      return false;
    }
  }, [currentTrack, setIsPlaying, onStreamRecovery, clearInterruptionState]);

  // Enhanced app state handling
  const handleAppStateChange = useCallback(async ({ isActive }: { isActive: boolean }) => {
    const audio = globalAudioRef.element;
    
    if (!isActive) {
      // App went to background
      logger.debug("App went to background");
      
      if (audio && !audio.paused) {
        setInterruptionState('background', true);
        // Don't pause the audio here - let it continue in background
        logger.info("App backgrounded but keeping audio playing");
      }
    } else {
      // App came to foreground
      logger.debug("App came to foreground");
      
      if (interruptionTypeRef.current === 'background') {
        // Small delay to ensure the system has settled
        setTimeout(() => {
          if (audio && audio.paused && wasPlayingBeforeInterruptionRef.current) {
            attemptPlaybackRecovery('app-foreground');
          } else {
            clearInterruptionState();
          }
        }, 500);
      }
    }
  }, [setInterruptionState, attemptPlaybackRecovery, clearInterruptionState]);

  // Audio Context monitoring
  const monitorAudioContext = useCallback(() => {
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      const AudioContextClass = AudioContext || (window as any).webkitAudioContext;
      
      try {
        const checkAudioContext = () => {
          // This is a simplified check - in practice, you might want to create a dedicated audio context
          // for monitoring purposes
          const audio = globalAudioRef.element;
          if (audio && isPlaying && audio.paused && currentTrack) {
            logger.debug("Audio context monitoring detected potential interruption");
            
            if (interruptionTypeRef.current === 'none') {
              setInterruptionState('audio-focus', true);
              
              // Try recovery after a delay
              recoveryTimeoutRef.current = setTimeout(() => {
                attemptPlaybackRecovery('audio-context-monitor');
              }, 2000);
            }
          }
        };

        audioContextStateCheckRef.current = setInterval(checkAudioContext, 3000);
      } catch (error) {
        logger.debug("Audio context monitoring not available:", error);
      }
    }
  }, [isPlaying, currentTrack, setInterruptionState, attemptPlaybackRecovery]);

  // Phone call detection via media session
  const handleMediaSessionInterruption = useCallback(() => {
    const audio = globalAudioRef.element;
    
    if (audio && !audio.paused && isPlaying) {
      logger.info("Media session interruption detected (likely phone call)");
      setInterruptionState('call', true);
      
      // Set up recovery check
      recoveryTimeoutRef.current = setTimeout(() => {
        // Check if we're still interrupted after some time
        if (interruptionTypeRef.current === 'call') {
          logger.debug("Long call interruption, will attempt recovery when possible");
          
          // Set up periodic recovery attempts
          const periodicRecovery = setInterval(() => {
            if (interruptionTypeRef.current === 'call') {
              logger.debug("Attempting periodic recovery during call interruption");
              attemptPlaybackRecovery('call-recovery-attempt').then(success => {
                if (success) {
                  clearInterval(periodicRecovery);
                }
              });
            } else {
              clearInterval(periodicRecovery);
            }
          }, 5000);
          
          // Clear periodic recovery after reasonable time
          setTimeout(() => {
            clearInterval(periodicRecovery);
          }, 300000); // 5 minutes
        }
      }, 10000);
    }
  }, [isPlaying, setInterruptionState, attemptPlaybackRecovery]);

  // Network change detection
  useEffect(() => {
    const handleConnectionChange = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        logger.debug("Network connection changed", {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        });
        
        // If connection is very poor and we're playing, consider it a network interruption
        if (connection.effectiveType === 'slow-2g' && isPlaying) {
          setInterruptionState('network', true);
          
          // Try recovery when connection improves
          const checkRecovery = () => {
            if (connection.effectiveType !== 'slow-2g') {
              attemptPlaybackRecovery('network-recovery');
            }
          };
          
          setTimeout(checkRecovery, 3000);
        }
      }
    };

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        connection.removeEventListener('change', handleConnectionChange);
      };
    }
  }, [isPlaying, setInterruptionState, attemptPlaybackRecovery]);

  // Set up app state listener
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    const setupListener = async () => {
      const appStateChangeListener = await App.addListener('appStateChange', handleAppStateChange);
      return () => appStateChangeListener.remove();
    };

    setupListener().then(cleanupFn => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [handleAppStateChange]);

  // Set up media session handlers
  useEffect(() => {
    const mediaSession = navigator.mediaSession;
    if (!mediaSession) return;

    const handlePause = () => {
      logger.debug("MediaSession: pause event");
      const audio = globalAudioRef.element;
      
      if (audio && !audio.paused) {
        handleMediaSessionInterruption();
        audio.pause();
        setIsPlaying(false);
      }
      updateGlobalPlaybackState(false, false, false);
    };

    const handlePlay = () => {
      logger.debug("MediaSession: play event");
      const audio = globalAudioRef.element;
      
      if (audio && audio.paused) {
        audio.play().then(() => {
          setIsPlaying(true);
          resetAudioStateForUserAction();
          clearInterruptionState();
        }).catch(error => {
          logger.error("Error playing via MediaSession:", error);
          setIsPlaying(false);
        });
      }
    };

    try {
      mediaSession.setActionHandler("pause", handlePause);
      mediaSession.setActionHandler("play", handlePlay);
    } catch (error) {
      logger.warn("Media Session action handler setup failed:", error);
    }

    return () => {
      try {
        mediaSession.setActionHandler("pause", null);
        mediaSession.setActionHandler("play", null);
      } catch (error) {
        logger.warn("Media Session action handler cleanup failed:", error);
      }
    };
  }, [setIsPlaying, handleMediaSessionInterruption, clearInterruptionState]);

  // Set up audio context monitoring
  useEffect(() => {
    if (isPlaying && currentTrack) {
      monitorAudioContext();
    }

    return () => {
      if (audioContextStateCheckRef.current) {
        clearInterval(audioContextStateCheckRef.current);
        audioContextStateCheckRef.current = null;
      }
    };
  }, [isPlaying, currentTrack, monitorAudioContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
      if (audioContextStateCheckRef.current) {
        clearInterval(audioContextStateCheckRef.current);
      }
    };
  }, []);

  return {
    interruptionType: interruptionTypeRef.current,
    wasPlayingBeforeInterruption: wasPlayingBeforeInterruptionRef.current,
    attemptPlaybackRecovery,
    setInterruptionState,
    clearInterruptionState
  };
};