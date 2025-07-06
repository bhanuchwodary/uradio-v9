
import { useEffect } from 'react';
import { globalAudioRef } from '@/components/music-player/audioInstance';
import { logger } from '@/utils/logger';

interface UseAudioPlayerEventsProps {
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setLoading: (loading: boolean) => void;
  nextTrack: () => void;
}

export const useAudioPlayerEvents = ({
  setCurrentTime,
  setDuration,
  setLoading,
  nextTrack,
}: UseAudioPlayerEventsProps) => {
  // Audio event listeners for time updates and better loading state management
  useEffect(() => {
    const audio = globalAudioRef.element;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      logger.debug("Track ended, moving to next track");
      nextTrack();
    };
    const handleLoadStart = () => {
      setLoading(true);
      logger.debug("Audio loading started");
    };
    const handleCanPlay = () => {
      setLoading(false);
      logger.debug("Audio can play");
    };
    const handleWaiting = () => {
      setLoading(true);
      logger.debug("Audio buffering");
    };
    const handlePlaying = () => {
      setLoading(false);
      logger.debug("Audio playing");
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
    };
  }, [nextTrack, setCurrentTime, setDuration, setLoading]);
};
