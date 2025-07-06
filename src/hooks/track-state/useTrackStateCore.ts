
import { useState, useMemo, useCallback } from "react";
import { useTrackInitialization } from "./useTrackInitialization";
import { useTrackStatePersistence } from "./useTrackStatePersistence";
import { useTrackStateDebugCore } from "./useTrackStateDebugCore";
import { logger } from "@/utils/logger";

export const useTrackStateCore = () => {
  // Basic state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Initialize tracks and get refs
  const {
    tracks,
    setTracks,
    tracksRef,
    lastSavedTracksJSON,
    isInitialized,
    renderCount,
    isDevMode
  } = useTrackInitialization();
  
  // Debug state
  const { stateVersion } = useTrackStateDebugCore();
  
  // Handle persistence
  const { needsSaving } = useTrackStatePersistence({
    tracks,
    isInitialized,
    lastSavedTracksJSON,
    tracksRef,
    isDevMode,
    renderCount,
    stateVersion
  });

  // Memoize tracks to prevent unnecessary re-renders
  const memoizedTracks = useMemo(() => tracks, [tracks]);

  // Enhanced setters with validation and playback safeguards - memoized with useCallback
  const setCurrentIndexSafe = useCallback((index: number) => {
    if (index >= 0 && index < tracks.length) {
      if (process.env.NODE_ENV === 'development') {
        console.log("Setting current index to:", index, "Track:", tracks[index]?.name);
      }
      setCurrentIndex(index);
    } else {
      logger.warn("Invalid track index", { index, tracksLength: tracks.length });
      // Reset to safe state if invalid index
      if (tracks.length > 0) {
        setCurrentIndex(0);
      }
    }
  }, [tracks]);

  // Enhanced setIsPlaying with intent validation - memoized with useCallback
  const setIsPlayingSafe = useCallback((playing: boolean) => {
    // Only allow playback if we have valid tracks and current index
    if (playing && (tracks.length === 0 || currentIndex >= tracks.length || currentIndex < 0)) {
      logger.warn("Attempted to start playback with invalid state", { 
        tracksLength: tracks.length, 
        currentIndex 
      });
      return;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log("Setting playback state to:", playing, "Current track:", tracks[currentIndex]?.name);
    }
    setIsPlaying(playing);
  }, [tracks, currentIndex]);

  return {
    tracks: memoizedTracks,
    setTracks,
    tracksRef,
    currentIndex,
    setCurrentIndex: setCurrentIndexSafe,
    isPlaying,
    setIsPlaying: setIsPlayingSafe,
    stateVersion,
    needsSaving,
    renderCount,
    isInitialized
  };
};
