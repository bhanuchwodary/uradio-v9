
import { useMusicPlayer } from "./useMusicPlayer";
import { Track } from "@/types/track";
import { getVolumePreference } from "@/utils/volumeStorage";

interface UsePlayerCoreProps {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  tracks: Track[];
  randomMode: boolean;
  setRandomMode: (randomMode: boolean) => void;
  // Add support for URLs-based usage (backward compatibility)
  urls?: string[];
  currentIndex?: number;
  setCurrentIndex?: (index: number) => void;
}

export const usePlayerCore = ({
  currentTrack,
  setCurrentTrack,
  isPlaying,
  setIsPlaying,
  loading,
  setLoading,
  audioRef,
  tracks,
  randomMode,
  setRandomMode,
  urls,
  currentIndex,
  setCurrentIndex
}: UsePlayerCoreProps) => {
  const initialVolume = getVolumePreference();
  
  // Handle both track-based and URL-based usage
  const workingUrls = urls || tracks.map(track => track.url);
  const workingCurrentIndex = currentIndex !== undefined ? currentIndex : (currentTrack ? tracks.findIndex(track => track.url === currentTrack.url) : 0);
  
  const setCurrentIndexHandler = (index: number) => {
    if (setCurrentIndex) {
      setCurrentIndex(index);
    } else if (index >= 0 && index < tracks.length) {
      setCurrentTrack(tracks[index]);
    }
  };

  // Enhanced handlers for random mode
  const enhancedHandlers = {
    handleNext: () => {
      if (tracks.length === 0) return;
      let nextIndex;
      if (randomMode) {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } else {
        const current = currentTrack ? tracks.findIndex(track => track.url === currentTrack.url) : workingCurrentIndex;
        nextIndex = (current + 1) % tracks.length;
      }
      if (setCurrentIndex) {
        setCurrentIndex(nextIndex);
      } else {
        setCurrentTrack(tracks[nextIndex]);
      }
    },
    handlePrevious: () => {
      if (tracks.length === 0) return;
      let prevIndex;
      if (randomMode) {
        prevIndex = Math.floor(Math.random() * tracks.length);
      } else {
        const current = currentTrack ? tracks.findIndex(track => track.url === currentTrack.url) : workingCurrentIndex;
        prevIndex = (current - 1 + tracks.length) % tracks.length;
      }
      if (setCurrentIndex) {
        setCurrentIndex(prevIndex);
      } else {
        setCurrentTrack(tracks[prevIndex]);
      }
    },
    randomMode
  };

  const playerProps = useMusicPlayer({
    urls: workingUrls,
    currentIndex: workingCurrentIndex,
    setCurrentIndex: setCurrentIndexHandler,
    isPlaying,
    setIsPlaying,
    tracks,
    initialVolume,
    enhancedHandlers
  });

  return {
    ...playerProps,
    playTrack: (track: Track) => {
      setCurrentTrack(track);
      setIsPlaying(true);
    },
    pausePlayback: () => setIsPlaying(false),
    resumePlayback: () => setIsPlaying(true),
    togglePlayPause: () => setIsPlaying(!isPlaying),
    nextTrack: enhancedHandlers.handleNext,
    previousTrack: enhancedHandlers.handlePrevious
  };
};
