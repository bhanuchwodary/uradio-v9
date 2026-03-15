import React, { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePlaylist } from "@/context/PlaylistContext";
import { useSyncFavorites } from "@/hooks/useSyncFavorites";
import { useSyncPlaylists } from "@/hooks/useSyncPlaylists";
import { logger } from "@/utils/logger";

/**
 * Background component that handles syncing favorites and playlists
 * when a user is logged in. Watches for playlist changes and syncs
 * them to the cloud with debouncing.
 */
export const SyncManager: React.FC = () => {
  const { user } = useAuth();
  const { playlistTracks } = usePlaylist();
  const { syncFromCloud: syncFavoritesFromCloud, syncAllToCloud: syncFavoritesToCloud } = useSyncFavorites();
  const { syncPlaylistToCloud } = useSyncPlaylists();
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialSyncDone = useRef(false);
  const prevTrackCount = useRef<number | null>(null);

  // Watch playlist changes and debounce sync to cloud
  useEffect(() => {
    if (!user) {
      initialSyncDone.current = false;
      prevTrackCount.current = null;
      return;
    }

    // Skip the initial render after cloud sync loads data
    if (!initialSyncDone.current) {
      // Mark initial sync as done after a short delay to let cloud data load
      const timer = setTimeout(() => {
        initialSyncDone.current = true;
        prevTrackCount.current = playlistTracks.length;
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Only sync if tracks actually changed
    if (prevTrackCount.current === playlistTracks.length && prevTrackCount.current !== null) {
      // Check if content changed (not just count)
      // We still debounce to catch reorders, favorite changes, etc.
    }
    
    prevTrackCount.current = playlistTracks.length;

    // Debounce the sync to avoid excessive API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      logger.debug("SyncManager: Syncing playlist to cloud", { count: playlistTracks.length });
      syncPlaylistToCloud();
    }, 2000);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [user, playlistTracks, syncPlaylistToCloud]);

  useEffect(() => {
    if (user) {
      logger.info("User logged in, starting sync", { userId: user.id });
    } else {
      logger.info("User logged out, sync disabled");
    }
  }, [user]);

  return null;
};

export default SyncManager;
