
import { useEffect } from "react";
import { globalAudioRef } from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger";

interface UseAudioInitializationProps {
  volume: number;
}

export const useAudioInitialization = ({ volume }: UseAudioInitializationProps) => {
  useEffect(() => {
    if (!globalAudioRef.element) {
      logger.info("Creating new global audio element.");
      const audio = new Audio();
      audio.preload = "none";
      audio.crossOrigin = "anonymous";
      audio.autoplay = false;
      audio.volume = volume;

      globalAudioRef.element = audio;

      const handleError = (e: Event) => {
        logger.error("Global Audio Element Error:", e);
      };
      globalAudioRef.element.addEventListener('error', handleError);

      return () => {
        if (globalAudioRef.element) {
          globalAudioRef.element.removeEventListener('error', handleError);
        }
      };
    } else {
      globalAudioRef.element.volume = volume;
      logger.debug("Global audio element already exists, updated volume.");
    }
  }, [volume]);
};
