
// src/hooks/usePhoneCallHandling.ts
import { useEffect, useRef, useCallback } from "react";
import { 
  globalAudioRef, 
  updateGlobalPlaybackState, 
  resetAudioStateForUserAction, 
  setInterruptionState,
  attemptInterruptionResume 
} from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger";
import { App } from '@capacitor/app';

export const usePhoneCallHandling = (isPlaying: boolean, setIsPlaying: (playing: boolean) => void) => {
  const initialIsPlayingRef = useRef(isPlaying);
  const wasPlayingBeforeInterruption = useRef(false);

  // Store the initial playback state when the component mounts
  useEffect(() => {
    initialIsPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Handle actual phone calls and audio interruptions (not just app backgrounding)
  const handleActualInterruption = useCallback(() => {
    logger.debug("Actual audio interruption detected (phone call, alarm, etc.)");
    if (globalAudioRef.element && !globalAudioRef.element.paused) {
      wasPlayingBeforeInterruption.current = true;
      globalAudioRef.shouldPlayAfterInterruption = true;
      setInterruptionState('phone-call', true);
      globalAudioRef.element.pause();
      setIsPlaying(false);
      logger.info("Playback paused due to actual audio interruption.");
    }
    updateGlobalPlaybackState(false, false, false);
  }, [setIsPlaying]);

  const handleInterruptionEnd = useCallback(async () => {
    logger.debug("Audio interruption ended, attempting resume");
    if (globalAudioRef.element && wasPlayingBeforeInterruption.current && globalAudioRef.shouldPlayAfterInterruption) {
      const playFunction = async () => {
        if (globalAudioRef.element) {
          await globalAudioRef.element.play();
          setIsPlaying(true);
          wasPlayingBeforeInterruption.current = false;
          logger.info("Playback resumed after interruption ended.");
        }
      };

      const resumeSuccess = await attemptInterruptionResume(playFunction);
      
      if (!resumeSuccess) {
        logger.warn("Failed to resume playback after interruption");
        setIsPlaying(false);
        wasPlayingBeforeInterruption.current = false;
      }
    }
  }, [setIsPlaying]);

  // Handle app state changes - but don't pause music for normal backgrounding
  const handleAppStateChange = useCallback((isActive: boolean) => {
    if (isActive) {
      logger.debug("App became active");
      // Only resume if there was an actual interruption, not just app backgrounding
      if (globalAudioRef.shouldPlayAfterInterruption && wasPlayingBeforeInterruption.current) {
        handleInterruptionEnd();
      }
    } else {
      logger.debug("App went to background - music should continue playing");
      // Don't pause music when app goes to background - this is normal behavior for music apps
      // Only pause if there's an actual audio interruption detected by the system
    }
  }, [handleInterruptionEnd]);

  useEffect(() => {
    // Capacitor App State Change Listener
    const setupListener = async () => {
      const appStateChangeListener = await App.addListener('appStateChange', ({ isActive }) => {
        handleAppStateChange(isActive);
      });

      return () => {
        appStateChangeListener.remove();
      };
    };

    let cleanup: (() => void) | undefined;
    setupListener().then(cleanupFn => {
      cleanup = cleanupFn;
    });

    // Listen for actual audio interruptions via Web Audio API
    const handleAudioInterruption = () => {
      handleActualInterruption();
    };

    const handleAudioInterruptionEnd = () => {
      handleInterruptionEnd();
    };

    // Listen for native audio session interruptions
    document.addEventListener('webkitbegininputsession', handleAudioInterruption);
    document.addEventListener('webkitendinputsession', handleAudioInterruptionEnd);

    // Cleanup
    return () => {
      if (cleanup) {
        cleanup();
      }
      document.removeEventListener('webkitbegininputsession', handleAudioInterruption);
      document.removeEventListener('webkitendinputsession', handleAudioInterruptionEnd);
    };
  }, [handleAppStateChange, handleActualInterruption, handleInterruptionEnd]);

  // Enhanced audio interruption detection for better phone call and focus handling
  useEffect(() => {
    // Listen for audio context state changes (better interruption detection)
    const handleAudioContextChange = () => {
      if ('webkitAudioContext' in window) {
        const audioContext = new (window as any).webkitAudioContext();
        audioContext.addEventListener('statechange', () => {
          if (audioContext.state === 'interrupted') {
            logger.debug("Audio context interrupted - likely phone call or system audio");
            handleActualInterruption();
          } else if (audioContext.state === 'running' && wasPlayingBeforeInterruption.current) {
            logger.debug("Audio context resumed - interruption ended");
            handleInterruptionEnd();
          }
        });
      }
    };

    // Listen for visibility changes that might indicate audio focus loss
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App went to background - don't pause, but be ready to detect interruptions
        logger.debug("App backgrounded - monitoring for audio interruptions");
      } else {
        // App came to foreground
        logger.debug("App foregrounded - checking if resume needed");
        if (globalAudioRef.shouldPlayAfterInterruption && wasPlayingBeforeInterruption.current) {
          setTimeout(() => handleInterruptionEnd(), 500); // Small delay for stability
        }
      }
    };

    // Enhanced audio session interruption listeners
    const handleBeginInterruption = () => {
      logger.debug("Audio session interruption began");
      handleActualInterruption();
    };

    const handleEndInterruption = () => {
      logger.debug("Audio session interruption ended");
      // Add delay to allow system to stabilize
      setTimeout(() => handleInterruptionEnd(), 1000);
    };

    // Set up listeners
    handleAudioContextChange();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('webkitbegininputsession', handleBeginInterruption);
    document.addEventListener('webkitendinputsession', handleEndInterruption);

    // Listen for native audio interruptions on mobile
    window.addEventListener('audiointerruptionbegin', handleBeginInterruption);
    window.addEventListener('audiointerruptionend', handleEndInterruption);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('webkitbegininputsession', handleBeginInterruption);
      document.removeEventListener('webkitendinputsession', handleEndInterruption);
      window.removeEventListener('audiointerruptionbegin', handleBeginInterruption);
      window.removeEventListener('audiointerruptionend', handleEndInterruption);
    };
  }, [handleActualInterruption, handleInterruptionEnd]);
};
