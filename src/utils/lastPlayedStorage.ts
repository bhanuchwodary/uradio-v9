import { Track } from '@/types/track';

const LAST_PLAYED_KEY = 'uradio_last_played_state';

interface LastPlayedState {
  track: Track | null;
  isPlaying: boolean;
  timestamp: number;
  volume: number;
  currentTime: number;
}

export const saveLastPlayedState = (
  track: Track | null,
  isPlaying: boolean,
  volume: number = 0.7,
  currentTime: number = 0
) => {
  try {
    const state: LastPlayedState = {
      track,
      isPlaying,
      timestamp: Date.now(),
      volume,
      currentTime
    };
    localStorage.setItem(LAST_PLAYED_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save last played state:', error);
  }
};

export const getLastPlayedState = (): LastPlayedState | null => {
  try {
    const stored = localStorage.getItem(LAST_PLAYED_KEY);
    if (!stored) return null;
    
    const state: LastPlayedState = JSON.parse(stored);
    
    // Only return state if it's less than 24 hours old
    const isRecent = (Date.now() - state.timestamp) < (24 * 60 * 60 * 1000);
    if (!isRecent) return null;
    
    return state;
  } catch (error) {
    console.warn('Failed to get last played state:', error);
    return null;
  }
};

export const clearLastPlayedState = () => {
  try {
    localStorage.removeItem(LAST_PLAYED_KEY);
  } catch (error) {
    console.warn('Failed to clear last played state:', error);
  }
};