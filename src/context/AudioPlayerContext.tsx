
import React, { createContext, useContext } from 'react';
import { Track } from '@/types/track';
import { useHlsHandler } from '@/hooks/music-player/useHlsHandler';
import { useEnhancedMediaSession } from '@/hooks/useEnhancedMediaSession';
import { useNativeMediaControls } from '@/hooks/useNativeMediaControls';
import { globalAudioRef } from '@/components/music-player/audioInstance';
import { AudioPlayerContextType, AudioPlayerProviderProps } from './types/AudioPlayerTypes';
import { useAudioPlayerState } from './hooks/useAudioPlayerState';
import { useAudioPlayerActions } from './hooks/useAudioPlayerActions';
import { useAudioPlayerEvents } from './hooks/useAudioPlayerEvents';
import { useBluetoothAutoResume } from '@/hooks/useBluetoothAutoResume';
import { usePhoneCallHandling } from '@/hooks/usePhoneCallHandling';

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ 
  children, 
  tracks,
  randomMode: initialRandomMode 
}) => {
  const {
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
    randomModeRef,
  } = useAudioPlayerState(initialRandomMode);

  const {
    playTrack,
    pausePlayback,
    resumePlayback,
    togglePlayPause,
    nextTrack,
    previousTrack,
    clearCurrentTrack,
  } = useAudioPlayerActions({
    currentTrack,
    setCurrentTrack,
    isPlaying,
    setIsPlaying,
    setLoading,
    setCurrentTime,
    setDuration,
    playlistTracks,
    tracks,
    randomModeRef,
  });

  // Use the HLS handler for stream management with enhanced loading handling
  useHlsHandler({
    url: currentTrack?.url,
    isPlaying,
    setIsPlaying,
    setLoading,
  });

  // Audio event listeners
  useAudioPlayerEvents({
    setCurrentTime,
    setDuration,
    setLoading,
    nextTrack,
  });

  // Enhanced media session integration
  useEnhancedMediaSession({
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    onPlay: resumePlayback,
    onPause: pausePlayback,
    onNext: nextTrack,
    onPrevious: previousTrack,
    onSeek: (time: number) => {
      const audio = globalAudioRef.element;
      if (audio) {
        audio.currentTime = time;
      }
    },
    onVolumeChange: setVolume,
  });

  // Native media controls for mobile platforms
  useNativeMediaControls({
    isPlaying,
    currentTrackName: currentTrack?.name,
    onPlay: resumePlayback,
    onPause: pausePlayback,
    onNext: nextTrack,
    onPrevious: previousTrack,
  });

  // Enhanced audio interruption handling
  usePhoneCallHandling(isPlaying, setIsPlaying);

  // Bluetooth auto-resume functionality
  useBluetoothAutoResume({
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    onResumePlayback: (track, resumeVolume) => {
      playTrack(track);
      setVolume(resumeVolume);
    }
  });

  const contextValue: AudioPlayerContextType = {
    currentTrack,
    isPlaying,
    randomMode,
    loading,
    volume,
    currentTime,
    duration,
    playTrack,
    pausePlayback,
    resumePlayback,
    togglePlayPause,
    nextTrack,
    previousTrack,
    setVolume,
    setRandomMode,
    clearCurrentTrack,
    setPlaylistTracks,
    playlistTracks,
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
      {children}
    </AudioPlayerContext.Provider>
  );
};
