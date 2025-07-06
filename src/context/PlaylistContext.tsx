
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { Track } from "@/types/track";
import { logger } from "@/utils/logger";

export interface PlaylistTrack extends Track {
  addedToPlaylistAt: number;
}

interface PlaylistContextType {
  playlistTracks: PlaylistTrack[];
  sortedPlaylistTracks: PlaylistTrack[];
  addToPlaylist: (track: Track) => boolean;
  removeFromPlaylist: (trackUrl: string) => boolean;
  clearPlaylist: () => number;
  isInPlaylist: (trackUrl: string) => boolean;
  getPlaylistTrack: (trackUrl: string) => PlaylistTrack | undefined;
  updatePlaylistTrackFavorite: (trackUrl: string, isFavorite: boolean) => void;
  playlistCount: number;
  isAddingToPlaylist: boolean;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

const PLAYLIST_STORAGE_KEY = 'uradio_playlist';

export const PlaylistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrack[]>([]);
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);

  // Load playlist from localStorage on init
  useEffect(() => {
    try {
      const savedPlaylist = localStorage.getItem(PLAYLIST_STORAGE_KEY);
      if (savedPlaylist) {
        const parsed = JSON.parse(savedPlaylist);
        setPlaylistTracks(parsed);
        logger.debug("Loaded playlist from storage", { count: parsed.length });
      }
    } catch (error) {
      logger.error("Error loading playlist from storage", error);
    }
  }, []);

  // Save playlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(playlistTracks));
      logger.debug("Saved playlist to storage", { count: playlistTracks.length });
    } catch (error) {
      logger.error("Error saving playlist to storage", error);
    }
  }, [playlistTracks]);

  // Sorted playlist tracks with favorites first, then by chronological order (first added first)
  const sortedPlaylistTracks = useMemo(() => {
    return [...playlistTracks].sort((a, b) => {
      // Favorites first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      // Then by added time (first added first for same favorite status)
      return a.addedToPlaylistAt - b.addedToPlaylistAt;
    });
  }, [playlistTracks]);

  const isInPlaylist = useCallback((trackUrl: string): boolean => {
    const normalizedUrl = trackUrl.toLowerCase().trim();
    return playlistTracks.some(t => 
      t.url.toLowerCase().trim() === normalizedUrl
    );
  }, [playlistTracks]);

  const addToPlaylist = useCallback((track: Track): boolean => {
    // Prevent multiple simultaneous additions
    if (isAddingToPlaylist) {
      console.log("PLAYLIST ADD BLOCKED: Already adding to playlist");
      return false;
    }

    // Check for duplicates first
    const normalizedUrl = track.url.toLowerCase().trim();
    const exists = playlistTracks.some(t => {
      const existingUrl = t.url.toLowerCase().trim();
      return existingUrl === normalizedUrl;
    });
    
    if (exists) {
      logger.warn("Track already in playlist", { url: track.url, name: track.name });
      console.log("PLAYLIST ADD BLOCKED: Duplicate detected");
      return false;
    }

    // Set adding state briefly to prevent double-clicks
    setIsAddingToPlaylist(true);

    const playlistTrack: PlaylistTrack = {
      ...track,
      addedToPlaylistAt: Date.now()
    };

    console.log("PLAYLIST ADD SUCCESS: Adding new track", { name: track.name, url: track.url });
    
    setPlaylistTracks(prev => {
      const newTracks = [...prev, playlistTrack];
      console.log("PLAYLIST STATE UPDATED: New count", newTracks.length);
      return newTracks;
    });
    
    // Reset the flag quickly to minimize UI flicker
    setTimeout(() => {
      setIsAddingToPlaylist(false);
    }, 50); // Reduced from 100ms to minimize flicker
    
    logger.info("Added track to playlist", { name: track.name });
    return true;
  }, [playlistTracks, isAddingToPlaylist]);

  const removeFromPlaylist = useCallback((trackUrl: string): boolean => {
    const exists = playlistTracks.some(t => t.url === trackUrl);
    if (!exists) {
      logger.warn("Track not found in playlist", { url: trackUrl });
      return false;
    }

    setPlaylistTracks(prev => prev.filter(t => t.url !== trackUrl));
    logger.info("Removed track from playlist", { url: trackUrl });
    return true;
  }, [playlistTracks]);

  const clearPlaylist = useCallback((): number => {
    const count = playlistTracks.length;
    setPlaylistTracks([]);
    logger.info("Cleared playlist", { removedCount: count });
    return count;
  }, [playlistTracks]);

  const getPlaylistTrack = useCallback((trackUrl: string): PlaylistTrack | undefined => {
    return playlistTracks.find(t => t.url === trackUrl);
  }, [playlistTracks]);

  const updatePlaylistTrackFavorite = useCallback((trackUrl: string, isFavorite: boolean): void => {
    setPlaylistTracks(prev => 
      prev.map(track => 
        track.url === trackUrl 
          ? { ...track, isFavorite }
          : track
      )
    );
    logger.info("Updated playlist track favorite status", { url: trackUrl, isFavorite });
  }, []);

  const contextValue: PlaylistContextType = {
    playlistTracks,
    sortedPlaylistTracks,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    isInPlaylist,
    getPlaylistTrack,
    updatePlaylistTrackFavorite,
    playlistCount: playlistTracks.length,
    isAddingToPlaylist
  };

  return (
    <PlaylistContext.Provider value={contextValue}>
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
};
