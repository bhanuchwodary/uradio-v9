
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

  // Enhanced Media Session integration for proper media controls
  useEffect(() => {
    const mediaSession = navigator.mediaSession;

    const handlePause = () => {
      logger.debug("MediaSession: pause event (user explicitly paused)");
      if (globalAudioRef.element && !globalAudioRef.element.paused) {
        globalAudioRef.element.pause();
        setIsPlaying(false);
        // This is explicit user action, not an interruption
        globalAudioRef.shouldPlayAfterInterruption = false;
      }
      updateGlobalPlaybackState(false, true, true); // Mark as explicitly paused
    };

    const handlePlay = () => {
      logger.debug("MediaSession: play event (user explicitly played)");
      if (globalAudioRef.element && globalAudioRef.element.paused) {
        globalAudioRef.element.play().then(() => {
          setIsPlaying(true);
          setInterruptionState('none', false);
          resetAudioStateForUserAction();
        }).catch(error => {
          logger.error("Error playing via MediaSession:", error);
          setIsPlaying(false);
        });
      }
    };

    if (mediaSession) {
      try {
        mediaSession.setActionHandler("pause", handlePause);
        mediaSession.setActionHandler("play", handlePlay);
      } catch (error) {
        logger.warn("Media Session action handler not supported or failed:", error);
      }
    }

    return () => {
      if (mediaSession) {
        try {
          mediaSession.setActionHandler("pause", null);
          mediaSession.setActionHandler("play", null);
        } catch (error) {
          logger.warn("Media Session action handler cleanup failed:", error);
        }
      }
    };
  }, [setIsPlaying]);
};
