import { useEffect, useCallback } from "react";
import { 
  globalAudioRef, 
  setInterruptionState,
  attemptInterruptionResume,
  updateGlobalPlaybackState 
} from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger";
import { Capacitor } from '@capacitor/core';

export const useAudioInterruptionHandling = (
  isPlaying: boolean, 
  setIsPlaying: (playing: boolean) => void
) => {
  
  // Handle native audio session interruptions (phone calls, alarms, etc.)
  const handleAudioInterruption = useCallback(async () => {
    logger.debug("Audio interruption detected");
    
    if (globalAudioRef.element && !globalAudioRef.element.paused) {
      globalAudioRef.shouldPlayAfterInterruption = true;
      setInterruptionState('audio-interruption', true);
      globalAudioRef.element.pause();
      setIsPlaying(false);
      logger.info("Playback paused due to audio interruption.");
    }
    updateGlobalPlaybackState(false, false, false);
  }, [setIsPlaying]);

  const handleAudioInterruptionEnd = useCallback(async () => {
    logger.debug("Audio interruption ended");
    
    if (globalAudioRef.element && globalAudioRef.shouldPlayAfterInterruption) {
      const playFunction = async () => {
        if (globalAudioRef.element) {
          await globalAudioRef.element.play();
          setIsPlaying(true);
          logger.info("Playback resumed after audio interruption ended.");
        }
      };

      const resumeSuccess = await attemptInterruptionResume(playFunction);
      
      if (!resumeSuccess) {
        logger.warn("Failed to resume playback after audio interruption");
        setIsPlaying(false);
      }
    }
  }, [setIsPlaying]);

  // Handle page visibility changes (covers many interruption scenarios)
  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Page is now hidden - potential interruption
      if (globalAudioRef.element && !globalAudioRef.element.paused) {
        globalAudioRef.shouldPlayAfterInterruption = true;
        setInterruptionState('app-state', true);
        // Don't pause immediately - let other handlers decide
        logger.debug("Page hidden, marking for potential resume");
      }
    } else {
      // Page is now visible - potential resume opportunity
      setTimeout(async () => {
        if (globalAudioRef.shouldPlayAfterInterruption && globalAudioRef.element?.paused) {
          const playFunction = async () => {
            if (globalAudioRef.element) {
              await globalAudioRef.element.play();
              setIsPlaying(true);
              logger.info("Playback resumed after page became visible.");
            }
          };

          await attemptInterruptionResume(playFunction);
        }
      }, 1000); // Give time for other systems to settle
    }
  }, [setIsPlaying]);

  // Handle audio context state changes
  const handleAudioContextStateChange = useCallback(() => {
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      const AudioContextClass = AudioContext || (window as any).webkitAudioContext;
      
      // Create or get existing audio context
      if (!(window as any).appAudioContext) {
        (window as any).appAudioContext = new AudioContextClass();
      }
      
      const audioContext = (window as any).appAudioContext;
      
      const handleStateChange = () => {
        logger.debug("Audio context state changed:", audioContext.state);
        
        if (audioContext.state === 'suspended' && globalAudioRef.element && !globalAudioRef.element.paused) {
          // Audio context suspended - likely an interruption
          handleAudioInterruption();
        } else if (audioContext.state === 'running' && globalAudioRef.shouldPlayAfterInterruption) {
          // Audio context resumed - interruption might be over
          setTimeout(() => {
            handleAudioInterruptionEnd();
          }, 500);
        }
      };
      
      audioContext.addEventListener('statechange', handleStateChange);
      
      return () => {
        audioContext.removeEventListener('statechange', handleStateChange);
      };
    }
  }, [handleAudioInterruption, handleAudioInterruptionEnd]);

  useEffect(() => {
    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Set up audio context monitoring
    const audioContextCleanup = handleAudioContextStateChange();

    // Set up beforeunload for cleanup
    const handleBeforeUnload = () => {
      if (globalAudioRef.element && !globalAudioRef.element.paused) {
        globalAudioRef.shouldPlayAfterInterruption = false; // Don't resume after page reload
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Native platform specific listeners
    if (Capacitor.isNativePlatform()) {
      // Listen for phone state changes (Android)
      const handlePhoneStateChange = (event: any) => {
        logger.debug("Phone state change detected:", event);
        
        if (event.detail?.state === 'CALL_STATE_RINGING' || event.detail?.state === 'CALL_STATE_OFFHOOK') {
          setInterruptionState('phone-call', true);
          handleAudioInterruption();
        } else if (event.detail?.state === 'CALL_STATE_IDLE') {
          setTimeout(() => {
            handleAudioInterruptionEnd();
          }, 2000); // Longer delay for call end
        }
      };

      // Add native event listeners
      document.addEventListener('phoneStateChange', handlePhoneStateChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('phoneStateChange', handlePhoneStateChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        if (audioContextCleanup) audioContextCleanup();
      };
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (audioContextCleanup) audioContextCleanup();
    };
  }, [handleVisibilityChange, handleAudioContextStateChange, handleAudioInterruption, handleAudioInterruptionEnd]);
};