
import { useCallback } from 'react';
import { Track } from '@/types/track';
import { logger } from '@/utils/logger';
import { handleStreamSwitch } from '@/utils/streamHandler';
import { globalAudioRef } from '@/components/music-player/audioInstance';

interface UseAudioPlayerActionsProps {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  setLoading: (loading: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  playlistTracks: Track[];
  tracks: Track[];
  randomModeRef: React.MutableRefObject<boolean>;
}

export const useAudioPlayerActions = ({
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
}: UseAudioPlayerActionsProps) => {
  const playTrack = useCallback(async (track: Track) => {
    console.log("AudioPlayerContext: playTrack called with:", track.name);
    logger.debug("Playing track", { trackName: track.name, url: track.url });
    
    // Set loading state immediately for better UX
    setLoading(true);
    
    // Set the track immediately
    setCurrentTrack(track);
    
    // If we have a global audio element and are switching tracks, handle gracefully
    const audio = globalAudioRef.element;
    if (audio && currentTrack && currentTrack.url !== track.url) {
      try {
        // Use enhanced stream switching for reliability
        await handleStreamSwitch(audio, track.url, setLoading, setIsPlaying);
        setIsPlaying(true);
        console.log("AudioPlayerContext: Stream switched successfully");
      } catch (error) {
        logger.error("Failed to switch stream", { error, trackName: track.name });
        setLoading(false);
        // Still set playing state to let the HLS handler try
        setIsPlaying(true);
      }
    } else {
      // For initial play or if no current track, proceed normally
      setIsPlaying(true);
    }
    
    console.log("AudioPlayerContext: Set track and playing state");
  }, [setCurrentTrack, setIsPlaying, setLoading, currentTrack]);

  const pausePlayback = useCallback(() => {
    console.log("AudioPlayerContext: pausePlayback called");
    setIsPlaying(false);
    logger.debug("Pausing playback");
  }, [setIsPlaying]);

  const resumePlayback = useCallback(() => {
    console.log("AudioPlayerContext: resumePlayback called");
    if (currentTrack) {
      setIsPlaying(true);
      logger.debug("Resuming playback");
    }
  }, [currentTrack, setIsPlaying]);

  const togglePlayPause = useCallback(() => {
    console.log("AudioPlayerContext: togglePlayPause called, current isPlaying:", isPlaying);
    if (currentTrack) {
      if (isPlaying) {
        pausePlayback();
      } else {
        resumePlayback();
      }
      logger.debug("Toggling play/pause");
    }
  }, [isPlaying, currentTrack, pausePlayback, resumePlayback]);

  const nextTrack = useCallback(async () => {
    console.log("AudioPlayerContext: nextTrack called with randomMode:", randomModeRef.current);
    
    // Use playlist tracks if available, otherwise fall back to main tracks
    const activeTrackList = playlistTracks.length > 0 ? playlistTracks : tracks;
    
    if (activeTrackList.length === 0) {
      console.log("AudioPlayerContext: No tracks available for next");
      return;
    }

    if (!currentTrack) {
      // If no current track, play first track
      const firstTrack = activeTrackList[0];
      console.log("AudioPlayerContext: No current track, playing first:", firstTrack.name);
      await playTrack(firstTrack);
      return;
    }
    
    const currentIndex = activeTrackList.findIndex(track => track.url === currentTrack.url);
    let nextIndex;
    
    if (randomModeRef.current) {
      // Ensure we don't repeat the same track in random mode
      const availableIndexes = activeTrackList.map((_, index) => index).filter(index => index !== currentIndex);
      if (availableIndexes.length > 0) {
        nextIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      } else {
        nextIndex = 0; // Fallback if only one track
      }
      console.log("AudioPlayerContext: Random mode - selected index:", nextIndex);
    } else {
      nextIndex = (currentIndex + 1) % activeTrackList.length;
      console.log("AudioPlayerContext: Sequential mode - next index:", nextIndex);
    }
    
    const nextTrackToPlay = activeTrackList[nextIndex];
    console.log("AudioPlayerContext: Playing next track:", nextTrackToPlay.name);
    await playTrack(nextTrackToPlay);
  }, [playlistTracks, tracks, currentTrack, playTrack, randomModeRef]);

  const previousTrack = useCallback(async () => {
    console.log("AudioPlayerContext: previousTrack called with randomMode:", randomModeRef.current);
    
    // Use playlist tracks if available, otherwise fall back to main tracks
    const activeTrackList = playlistTracks.length > 0 ? playlistTracks : tracks;
    
    if (activeTrackList.length === 0) {
      console.log("AudioPlayerContext: No tracks available for previous");
      return;
    }

    if (!currentTrack) {
      // If no current track, play last track
      const lastTrack = activeTrackList[activeTrackList.length - 1];
      console.log("AudioPlayerContext: No current track, playing last:", lastTrack.name);
      await playTrack(lastTrack);
      return;
    }
    
    const currentIndex = activeTrackList.findIndex(track => track.url === currentTrack.url);
    let prevIndex;
    
    if (randomModeRef.current) {
      // Ensure we don't repeat the same track in random mode
      const availableIndexes = activeTrackList.map((_, index) => index).filter(index => index !== currentIndex);
      if (availableIndexes.length > 0) {
        prevIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      } else {
        prevIndex = activeTrackList.length - 1; // Fallback if only one track
      }
      console.log("AudioPlayerContext: Random mode - selected index:", prevIndex);
    } else {
      prevIndex = (currentIndex - 1 + activeTrackList.length) % activeTrackList.length;
      console.log("AudioPlayerContext: Sequential mode - previous index:", prevIndex);
    }
    
    const prevTrackToPlay = activeTrackList[prevIndex];
    console.log("AudioPlayerContext: Playing previous track:", prevTrackToPlay.name);
    await playTrack(prevTrackToPlay);
  }, [playlistTracks, tracks, currentTrack, playTrack, randomModeRef]);

  const clearCurrentTrack = useCallback(() => {
    console.log("AudioPlayerContext: clearCurrentTrack called");
    setCurrentTrack(null);
    setIsPlaying(false);
    setLoading(false);
    setCurrentTime(0);
    setDuration(0);
    logger.debug("Cleared current track");
  }, [setCurrentTrack, setIsPlaying, setLoading, setCurrentTime, setDuration]);

  return {
    playTrack,
    pausePlayback,
    resumePlayback,
    togglePlayPause,
    nextTrack,
    previousTrack,
    clearCurrentTrack,
  };
};
