
import { useCallback } from "react";
import { Track } from "@/types/track";
import { checkIfStationExists, getUserStations, getTopStations } from "./trackUtils";

/**
 * Hook for track management operations that don't modify state
 */
export const useTrackManagement = (
  tracks: Track[], 
  tracksRef?: React.MutableRefObject<Track[]>
) => {
  // Get user-created stations (non-prebuilt)
  const getMyStations = useCallback(() => {
    // Use tracksRef for most up-to-date value when available
    const currentTracks = tracksRef?.current || tracks;
    return getUserStations(currentTracks);
  }, [tracks, tracksRef]);

  // Get popular stations by play time
  const getPopularStations = useCallback(() => {
    // Use tracksRef for most up-to-date value when available
    const currentTracks = tracksRef?.current || tracks;
    return getTopStations(currentTracks);
  }, [tracks, tracksRef]);

  // Check if a station with the given URL already exists
  const stationExists = useCallback((url: string) => {
    // Use tracksRef for most up-to-date value when available
    const currentTracks = tracksRef?.current || tracks;
    return checkIfStationExists(url, currentTracks);
  }, [tracks, tracksRef]);

  return {
    getMyStations,
    getPopularStations,
    stationExists
  };
};
