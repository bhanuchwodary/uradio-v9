
import { useEffect, useCallback } from "react";
import { globalAudioRef, updateGlobalPlaybackState, setNavigationState } from "@/components/music-player/audioInstance";
import { logger } from "@/utils/logger";

interface UsePlayerControlsProps {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  volume: number;
}

export const usePlayerControls = ({
  isPlaying,
  setIsPlaying,
  urls,
  currentIndex,
  setCurrentIndex,
  volume
}: UsePlayerControlsProps) => {
  const handleNext = useCallback(() => {
    if (urls.length === 0) return;
    const nextIndex = (currentIndex + 1) % urls.length;
    logger.info("Navigation: Next track selected, index:", nextIndex);
    setCurrentIndex(nextIndex);

    if (isPlaying) {
      setIsPlaying(true);
      logger.debug("Continuing playback on next track (triggering setIsPlaying).");
    } else {
      setIsPlaying(false);
    }
    updateGlobalPlaybackState(false, false, false);
    setNavigationState(false);
  }, [currentIndex, isPlaying, setCurrentIndex, setIsPlaying, urls]);

  const handlePrevious = useCallback(() => {
    if (urls.length === 0) return;
    const prevIndex = (currentIndex - 1 + urls.length) % urls.length;
    logger.info("Navigation: Previous track selected, index:", prevIndex);
    setCurrentIndex(prevIndex);

    if (isPlaying) {
      setIsPlaying(true);
      logger.debug("Continuing playback on previous track (triggering setIsPlaying).");
    } else {
      setIsPlaying(false);
    }
    updateGlobalPlaybackState(false, false, false);
    setNavigationState(false);
  }, [currentIndex, isPlaying, setCurrentIndex, setIsPlaying, urls]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
    logger.debug("Play/pause toggled");
  }, [isPlaying, setIsPlaying]);

  const handleSeek = useCallback((seekTo: number[]) => {
    if (globalAudioRef.element && seekTo.length > 0) {
      globalAudioRef.element.currentTime = seekTo[0];
      logger.debug("Seeked to:", seekTo[0]);
    }
  }, []);

  return { handleNext, handlePrevious, handlePlayPause, handleSeek };
};
