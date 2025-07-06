
import { useState, useRef, useEffect } from 'react';
import { Track } from '@/types/track';
import { globalAudioRef } from '@/components/music-player/audioInstance';
import { logger } from '@/utils/logger';
import { getRandomModePreference, saveRandomModePreference } from '@/utils/randomModeStorage';

export const useAudioPlayerState = (initialRandomMode: boolean) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [randomMode, setRandomMode] = useState(() => getRandomModePreference());
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const randomModeRef = useRef(randomMode);

  // Keep randomMode ref in sync for stable reference in callbacks
  useEffect(() => {
    randomModeRef.current = randomMode;
  }, [randomMode]);

  // Save random mode preference when it changes
  useEffect(() => {
    saveRandomModePreference(randomMode);
  }, [randomMode]);

  // Initialize global audio element if not already done
  useEffect(() => {
    if (!globalAudioRef.element) {
      const audio = new Audio();
      audio.preload = 'auto';
      globalAudioRef.element = audio;
      logger.debug("Global audio element initialized");
    }
    audioRef.current = globalAudioRef.element;
  }, []);

  // Volume control
  useEffect(() => {
    const audio = globalAudioRef.element;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  return {
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    randomMode,
    setRandomMode,
    loading,
    setLoading,
    volume,
    setVolume,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    playlistTracks,
    setPlaylistTracks,
    audioRef,
    randomModeRef,
  };
};
