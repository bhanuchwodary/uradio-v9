
import { Track } from '@/types/track';

export interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  randomMode: boolean;
  loading: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  playTrack: (track: Track) => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  setRandomMode: (randomMode: boolean) => void;
  clearCurrentTrack: () => void;
  setPlaylistTracks: (tracks: Track[]) => void;
  playlistTracks: Track[];
}

export interface AudioPlayerProviderProps {
  children: React.ReactNode;
  tracks: Track[];
  randomMode: boolean;
}
