
import { useCallback } from "react";
import { Track } from "@/types/track";
import { testLocalStorage, verifySyncStatus } from "./trackStorage";

export const useTrackDebug = (
  tracks: Track[], 
  currentIndex: number,
  isPlaying: boolean,
  isInitialized: boolean,
  needsSaving: React.MutableRefObject<boolean>,
  stateVersion: React.MutableRefObject<number>
) => {
  // Function to debug the current state
  const debugState = useCallback(() => {
    console.log("---- TRACK STATE DEBUG ----");
    console.log("Total tracks:", tracks.length);
    console.log("Current index:", currentIndex);
    console.log("Is playing:", isPlaying);
    console.log("Is initialized:", isInitialized);
    console.log("Need saving:", needsSaving.current);
    console.log("State version:", stateVersion.current);
    
    if (tracks.length > 0) {
      console.log("All tracks in state:");
      console.log(JSON.stringify(tracks));
    }
    
    const localStorageStatus = testLocalStorage();
    console.log("localStorage working:", localStorageStatus);
    
    if (localStorageStatus) {
      console.log("localStorage/state in sync:", verifySyncStatus(tracks));
    }
    
    console.log("---------------------------");
    
    return {
      tracksCount: tracks.length,
      isInitialized,
      localStorageWorking: localStorageStatus,
      stateVersion: stateVersion.current
    };
  }, [tracks, currentIndex, isPlaying, isInitialized, needsSaving, stateVersion]);

  return {
    debugState
  };
};
