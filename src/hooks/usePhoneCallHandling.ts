
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
import { App } from '@capacitor/app'; // Import Capacitor App plugin
import { useAudioInterruptionHandling } from "./useAudioInterruptionHandling";

export const usePhoneCallHandling = (isPlaying: boolean, setIsPlaying: (playing: boolean) => void) => {
  // Use the enhanced audio interruption handling
  useAudioInterruptionHandling(isPlaying, setIsPlaying);
  const initialIsPlayingRef = useRef(isPlaying);

  // Store the initial playback state when the component mounts
  useEffect(() => {
    initialIsPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const handleAppFocusLoss = useCallback(() => {
    logger.debug("App focus lost (background/call/other app audio)");
    if (globalAudioRef.element && !globalAudioRef.element.paused) {
      globalAudioRef.shouldPlayAfterInterruption = true;
      setInterruptionState('app-state', true);
      globalAudioRef.element.pause();
      setIsPlaying(false);
      logger.info("Playback paused due to app focus loss.");
    } else {
      globalAudioRef.shouldPlayAfterInterruption = false;
      setInterruptionState('none', false);
    }
    updateGlobalPlaybackState(false, false, false); // Clear states
  }, [setIsPlaying]);

  const handleAppFocusGain = useCallback(async () => {
    logger.debug("App focus gained (foreground)");
    if (globalAudioRef.element && globalAudioRef.shouldPlayAfterInterruption) {
      // Use enhanced resume logic with adaptive delays and retry mechanism
      const playFunction = async () => {
        if (globalAudioRef.element) {
          await globalAudioRef.element.play();
          setIsPlaying(true);
          logger.info("Playback resumed after app focus gain.");
          resetAudioStateForUserAction();
        }
      };

      const resumeSuccess = await attemptInterruptionResume(playFunction);
      
      if (!resumeSuccess) {
        logger.warn("Failed to resume playback after app focus gain");
        setIsPlaying(false);
        resetAudioStateForUserAction();
      }
    }
  }, [setIsPlaying]);

  useEffect(() => {
    // Capacitor App State Change Listener
    const setupListener = async () => {
      const appStateChangeListener = await App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          handleAppFocusGain();
        } else {
          handleAppFocusLoss();
        }
      });

      return () => {
        appStateChangeListener.remove();
      };
    };

    let cleanup: (() => void) | undefined;
    setupListener().then(cleanupFn => {
      cleanup = cleanupFn;
    });

    // Cleanup
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [handleAppFocusGain, handleAppFocusLoss]);

  // Keep existing Media Session listeners as they are important for controls and some focus changes
  useEffect(() => {
      const mediaSession = navigator.mediaSession;

      const handlePause = () => {
          logger.debug("MediaSession: pause event");
          if (globalAudioRef.element && !globalAudioRef.element.paused) {
              setInterruptionState('media-session', true);
              globalAudioRef.element.pause();
              setIsPlaying(false);
              globalAudioRef.shouldPlayAfterInterruption = true; // Still consider it interrupted by MediaSession
          }
          updateGlobalPlaybackState(false, false, false);
      };

      const handlePlay = () => {
          logger.debug("MediaSession: play event");
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
