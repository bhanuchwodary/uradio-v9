
import { useEffect, useRef } from "react";
import { Track } from "@/types/track";
import { saveTracksToLocalStorage } from "./trackStorage";
import { logger } from "@/utils/logger";

interface UseTrackStatePersistenceProps {
  tracks: Track[];
  isInitialized: boolean;
  lastSavedTracksJSON: React.MutableRefObject<string>;
  tracksRef: React.MutableRefObject<Track[]>;
  isDevMode: boolean;
  renderCount: React.MutableRefObject<number>;
  stateVersion: React.MutableRefObject<number>;
}

export const useTrackStatePersistence = ({
  tracks,
  isInitialized,
  lastSavedTracksJSON,
  tracksRef,
  isDevMode,
  renderCount,
  stateVersion
}: UseTrackStatePersistenceProps) => {
  // Refs for performance optimization
  const needsSaving = useRef(false);
  const syncInProgress = useRef(false);

  // Save tracks to localStorage whenever they change (but after initialization)
  useEffect(() => {
    if (isDevMode) {
      renderCount.current++;
      stateVersion.current++;
      const currentVersion = stateVersion.current;
      logger.debug("Tracks state changed", { 
        renderCount: renderCount.current, 
        stateVersion: currentVersion,
        tracksCount: tracks.length
      });
    }
    
    // Update ref for direct access elsewhere
    tracksRef.current = tracks;
    
    if (isInitialized && !syncInProgress.current) {
      // Only save if tracks have actually changed (prevents unnecessary writes)
      const currentTracksJSON = JSON.stringify(tracks);
      if (currentTracksJSON !== lastSavedTracksJSON.current) {
        logger.debug("Saving tracks to localStorage", { count: tracks.length });
        
        // Mark that we need to save
        needsSaving.current = true;
        syncInProgress.current = true;
        
        // Save immediately to prevent losing data during navigation
        const saveSuccess = saveTracksToLocalStorage(tracks);
        if (saveSuccess) {
          needsSaving.current = false;
          lastSavedTracksJSON.current = currentTracksJSON;
          logger.info("Successfully saved tracks to localStorage");
        } else {
          logger.error("Failed to save tracks to localStorage");
        }
        
        syncInProgress.current = false;
      }
    }
  }, [tracks, isInitialized, isDevMode, renderCount, stateVersion, tracksRef, lastSavedTracksJSON]);

  // Simplified integrity check that doesn't cause infinite loops
  useEffect(() => {
    if (!isInitialized) return;
    
    // Force save on page unload
    const handleBeforeUnload = () => {
      if (tracks.length > 0 && !syncInProgress.current) {
        logger.info("Page unloading - force saving tracks");
        saveTracksToLocalStorage(tracks);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tracks, isInitialized]);

  return {
    needsSaving,
    syncInProgress
  };
};
