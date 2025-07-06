
import { Track } from "@/types/track";

export interface TrackStateResult {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (playing: boolean) => void;
  addUrl: (url: string, name?: string, isPrebuilt?: boolean, isFavorite?: boolean, language?: string) => { success: boolean, message: string };
  removeUrl: (index: number) => void;
  toggleFavorite: (index: number) => void;
  editTrack: (index: number, data: { url: string; name: string; language?: string }) => void;
  updatePlayTime: (index: number, seconds: number) => void;
  getTopStations: () => Track[];
  getUserStations: () => Track[];
  checkIfStationExists: (url: string) => { exists: boolean, isUserStation: boolean };
  editStationByValue: (station: Track, data: { url: string; name: string; language?: string }) => void;
  removeStationByValue: (station: Track) => void;
  debugState?: () => { 
    tracksCount: number;
    isInitialized: boolean;
    localStorageWorking: boolean;
    stateVersion: number;
  };
}
