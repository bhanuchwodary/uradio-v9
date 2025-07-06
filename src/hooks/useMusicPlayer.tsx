
import { useState, useRef } from "react";
import { Track } from "@/types/track";
import { globalAudioRef } from "@/components/music-player/audioInstance";
import { useMediaSession } from "@/hooks/useMediaSession";
import { useHlsHandler } from "./music-player/useHlsHandler";
import { useAudioEvents } from "./music-player/useAudioEvents";
import { useAudioInitialization } from "./music-player/useAudioInitialization";
import { usePlayerControls } from "./music-player/usePlayerControls";

interface UseMusicPlayerProps {
  urls: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  tracks?: Track[];
  initialVolume?: number;
  enhancedHandlers?: {
    handleNext: () => void;
    handlePrevious: () => void;
    randomMode: boolean;
  };
}

export const useMusicPlayer = (props?: UseMusicPlayerProps) => {
  const {
    urls = [],
    currentIndex = 0,
    setCurrentIndex = () => {},
    isPlaying = false,
    setIsPlaying = () => {},
    tracks = [],
    initialVolume = 0.7,
    enhancedHandlers,
  } = props || {};

  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(initialVolume);
  const [loading, setLoading] = useState<boolean>(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerInstanceRef = useRef<symbol>(Symbol("playerInstance"));

  // Initialize audio
  useAudioInitialization({
    volume
  });

  // Set up player controls
  const {
    handleNext: basicHandleNext,
    handlePrevious: basicHandlePrevious,
    handlePlayPause,
    handleSeek
  } = usePlayerControls({
    isPlaying,
    setIsPlaying,
    urls,
    currentIndex,
    setCurrentIndex,
    volume
  });

  // Use enhanced handlers if available, otherwise fall back to basic ones
  const handleNext = enhancedHandlers?.handleNext || basicHandleNext;
  const handlePrevious = enhancedHandlers?.handlePrevious || basicHandlePrevious;

  // Handle HLS streaming
  useHlsHandler({
    url: urls[currentIndex],
    isPlaying,
    setIsPlaying,
    setLoading
  });

  // Set up audio event listeners
  useAudioEvents({
    audioRef,
    setCurrentTime,
    setDuration,
    onEnded: handleNext,
    setLoading
  });

  // Set up media session API with enhanced handlers
  useMediaSession({
    tracks,
    currentIndex,
    isPlaying,
    trackDuration: duration,
    trackPosition: currentTime,
    setIsPlaying,
    onSkipNext: handleNext,
    onSkipPrevious: handlePrevious,
    onSeek: (position) => {
      handleSeek([position]);
    },
    randomMode: enhancedHandlers?.randomMode || false,
  });

  return {
    duration,
    currentTime,
    volume,
    setVolume,
    loading,
    handlePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
    urls,
    tracks,
    removeUrl: (index: number) => console.warn("removeUrl not implemented"),
    editTrack: (index: number, data: { url: string; name: string }) => 
      console.warn("editTrack not implemented"),
  };
};
