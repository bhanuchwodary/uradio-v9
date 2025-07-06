
import { Track } from "@/types/track";
import { logger } from "@/utils/logger";
import { STORAGE_KEYS } from "@/constants/app";

export const testLocalStorage = (): boolean => {
  try {
    const testKey = 'test-storage';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    logger.warn('localStorage is not available', error);
    return false;
  }
};

export const saveTracksToLocalStorage = (tracks: Track[]): boolean => {
  try {
    const tracksJson = JSON.stringify(tracks);
    localStorage.setItem(STORAGE_KEYS.TRACKS, tracksJson);
    logger.debug(`Saved ${tracks.length} tracks to localStorage`);
    return true;
  } catch (error) {
    logger.error('Failed to save tracks to localStorage', error);
    return false;
  }
};

export const loadTracksFromLocalStorage = (): Track[] => {
  try {
    logger.debug('Loading tracks from localStorage...');
    const tracksJson = localStorage.getItem(STORAGE_KEYS.TRACKS);
    
    if (!tracksJson) {
      logger.debug('No saved tracks found in localStorage');
      return [];
    }
    
    const tracks = JSON.parse(tracksJson) as Track[];
    
    // Validate the loaded tracks structure
    if (!Array.isArray(tracks)) {
      logger.warn('Invalid tracks data structure, resetting to empty array');
      return [];
    }
    
    // Validate each track has required properties
    const validTracks = tracks.filter(track => 
      track && 
      typeof track.url === 'string' && 
      typeof track.name === 'string'
    );
    
    if (validTracks.length !== tracks.length) {
      logger.warn(`Filtered out ${tracks.length - validTracks.length} invalid tracks`);
    }
    
    logger.debug(`Loaded ${validTracks.length} tracks from localStorage`);
    return validTracks;
  } catch (error) {
    logger.error('Failed to load tracks from localStorage', error);
    return [];
  }
};

export const clearTracksFromLocalStorage = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TRACKS);
    logger.info('Cleared tracks from localStorage');
    return true;
  } catch (error) {
    logger.error('Failed to clear tracks from localStorage', error);
    return false;
  }
};

// Simplified sync verification that doesn't cause loops
export const verifySyncStatus = (currentTracks: Track[]): boolean => {
  try {
    const storedTracksJson = localStorage.getItem(STORAGE_KEYS.TRACKS);
    const currentTracksJson = JSON.stringify(currentTracks);
    
    // If no storage data and no current tracks, they're in sync
    if (!storedTracksJson && currentTracks.length === 0) {
      return true;
    }
    
    // If no storage data but we have current tracks, not in sync
    if (!storedTracksJson && currentTracks.length > 0) {
      return false;
    }
    
    // If storage data exists, compare JSON strings
    return storedTracksJson === currentTracksJson;
  } catch (error) {
    logger.error('Error verifying sync status', error);
    return false; // Assume not in sync if we can't verify
  }
};
