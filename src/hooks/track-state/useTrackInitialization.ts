
import { useState, useEffect, useRef } from "react";
import { Track } from "@/types/track";
import { loadTracksFromLocalStorage, testLocalStorage } from "./trackStorage";
import { logger } from "@/utils/logger";

export const useTrackInitialization = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs for performance optimization
  const tracksRef = useRef<Track[]>([]);
  const lastSavedTracksJSON = useRef<string>('[]');
  
  // Debug counter to track render cycles
  const renderCount = useRef(0);
  const isDevMode = process.env.NODE_ENV === 'development';

  // Initialization effect - runs only once
  useEffect(() => {
    if (isDevMode) {
      renderCount.current++;
      logger.debug("useTrackInitialization - Initial load from localStorage");
    }
    
    // Test if localStorage is working properly
    const storageAvailable = testLocalStorage();
    logger.info("LocalStorage availability check", { available: storageAvailable });
    
    if (storageAvailable) {
      const loadedTracks = loadTracksFromLocalStorage();
      logger.info("Initial tracks loaded from localStorage", { count: loadedTracks.length });
      
      if (loadedTracks && loadedTracks.length > 0) {
        if (isDevMode) {
          logger.debug("First loaded track", loadedTracks[0]);
        }
        
        // Use a deep clone to ensure we're working with a fresh copy
        const freshTracks = JSON.parse(JSON.stringify(loadedTracks));
        tracksRef.current = freshTracks;
        setTracks(freshTracks);
        lastSavedTracksJSON.current = JSON.stringify(freshTracks);
      } else {
        // Initialize with empty array if no tracks found
        lastSavedTracksJSON.current = '[]';
      }
    }
    
    setIsInitialized(true);
    logger.info("Track state initialized", { renderCount: renderCount.current });
  }, [isDevMode]);

  return {
    tracks,
    setTracks,
    tracksRef,
    lastSavedTracksJSON,
    isInitialized,
    renderCount,
    isDevMode
  };
};
