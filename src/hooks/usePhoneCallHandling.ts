
// src/hooks/usePhoneCallHandling.ts
import { useEffect, useRef, useCallback } from "react";
import { globalAudioRef, updateGlobalPlaybackState, resetAudioStateForUserAction } from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger";
import { App } from '@capacitor/app'; // Import Capacitor App plugin

export const usePhoneCallHandling = (isPlaying: boolean, setIsPlaying: (playing: boolean) => void) => {
  const initialIsPlayingRef = useRef(isPlaying);

  // Store the initial playback state when the component mounts
  useEffect(() => {
    initialIsPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const handleAppFocusLoss = useCallback(() => {
    logger.debug("App focus lost (background/call/other app audio)");
    if (globalAudioRef.element && !globalAudioRef.element.paused) {
      globalAudioRef.shouldPlayAfterInterruption = true;
      globalAudioRef.element.pause();
      setIsPlaying(false);
      logger.info("Playback paused due to app focus loss.");
    } else {
      globalAudioRef.shouldPlayAfterInterruption = false;
    }
    updateGlobalPlaybackState(false, false, false); // Clear states
  }, [setIsPlaying]);

  const handleAppFocusGain = useCallback(() => {
    logger.debug("App focus gained (foreground)");
    if (globalAudioRef.element && globalAudioRef.shouldPlayAfterInterruption) {
      // Attempt to play only if it was playing before interruption and not explicitly paused by user
      // Using a timeout to give the OS a moment to release audio focus if it was held.
      setTimeout(() => {
        if (globalAudioRef.element) {
          globalAudioRef.element.play().then(() => {
            setIsPlaying(true);
            logger.info("Playback resumed after app focus gain.");
            resetAudioStateForUserAction(); // Reset flags after successful resume
          }).catch(error => {
            logger.error("Error resuming playback after focus gain:", error);
            setIsPlaying(false); // Ensure UI reflects actual state if play fails
            resetAudioStateForUserAction(); // Reset flags even on failure
          });
        }
      }, 500); // Small delay to allow system audio focus to release
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
