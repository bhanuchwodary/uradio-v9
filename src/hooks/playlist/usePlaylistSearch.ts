
import { useMemo } from 'react';
import { PlaylistTrack } from '@/context/PlaylistContext';

export const usePlaylistSearch = (tracks: PlaylistTrack[], searchTerm: string) => {
  return useMemo(() => {
    if (!searchTerm.trim()) {
      return tracks;
    }

    const term = searchTerm.toLowerCase().trim();
    return tracks.filter(track => 
      track.name.toLowerCase().includes(term) ||
      (track.language && track.language.toLowerCase().includes(term))
    );
  }, [tracks, searchTerm]);
};
