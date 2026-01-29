import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { usePlaylist } from "@/context/PlaylistContext";
import { Track } from "@/types/track";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";

interface DbPlaylistItem {
  id: string;
  user_id: string;
  station_id: string;
  station_name: string;
  station_url: string;
  station_logo: string | null;
  station_genre: string | null;
  position: number;
  created_at: string;
}

export const useSyncPlaylists = () => {
  const { user } = useAuth();
  const { playlistTracks, addToPlaylist, clearPlaylist } = usePlaylist();
  const { toast } = useToast();
  const isSyncing = useRef(false);
  const lastSyncRef = useRef<string | null>(null);

  // Sync playlist from cloud to local
  const syncFromCloud = useCallback(async () => {
    if (!user || isSyncing.current) return;

    isSyncing.current = true;
    try {
      const { data: cloudPlaylist, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true });

      if (error) {
        logger.error("Error fetching cloud playlist", error);
        return;
      }

      if (cloudPlaylist && cloudPlaylist.length > 0) {
        // Convert to Track format and add to local playlist
        const cloudTracks: Track[] = (cloudPlaylist as DbPlaylistItem[]).map((item) => ({
          url: item.station_url,
          name: item.station_name,
          language: item.station_genre || undefined,
          isFavorite: false,
          isFeatured: false,
          playTime: 0,
        }));

        // Only add tracks that aren't already in the playlist
        const existingUrls = new Set(playlistTracks.map(t => t.url));
        cloudTracks.forEach(track => {
          if (!existingUrls.has(track.url)) {
            addToPlaylist(track);
          }
        });

        logger.debug("Synced playlist from cloud", { count: cloudPlaylist.length });
      }
    } catch (error) {
      logger.error("Error syncing playlist from cloud", error);
    } finally {
      isSyncing.current = false;
    }
  }, [user, playlistTracks, addToPlaylist]);

  // Sync entire playlist to cloud
  const syncPlaylistToCloud = useCallback(async () => {
    if (!user || playlistTracks.length === 0) return;

    try {
      // First, delete existing playlist items
      await supabase
        .from("playlists")
        .delete()
        .eq("user_id", user.id);

      // Then insert all current playlist items
      const playlistData = playlistTracks.map((track, index) => ({
        user_id: user.id,
        station_id: track.url,
        station_name: track.name,
        station_url: track.url,
        station_logo: null,
        station_genre: track.language || null,
        position: index,
      }));

      const { error } = await supabase.from("playlists").insert(playlistData);

      if (error) {
        logger.error("Error syncing playlist to cloud", error);
      } else {
        logger.debug("Synced playlist to cloud", { count: playlistTracks.length });
      }
    } catch (error) {
      logger.error("Error syncing playlist to cloud", error);
    }
  }, [user, playlistTracks]);

  // Add single item to cloud playlist
  const addToCloudPlaylist = useCallback(async (track: Track) => {
    if (!user) return;

    try {
      // Get current max position
      const { data: maxPos } = await supabase
        .from("playlists")
        .select("position")
        .eq("user_id", user.id)
        .order("position", { ascending: false })
        .limit(1)
        .single();

      const nextPosition = maxPos ? maxPos.position + 1 : 0;

      const { error } = await supabase.from("playlists").upsert({
        user_id: user.id,
        station_id: track.url,
        station_name: track.name,
        station_url: track.url,
        station_logo: null,
        station_genre: track.language || null,
        position: nextPosition,
      }, {
        onConflict: "user_id,station_id"
      });

      if (error) {
        logger.error("Error adding to cloud playlist", error);
      } else {
        logger.debug("Added to cloud playlist", { name: track.name });
      }
    } catch (error) {
      logger.error("Error adding to cloud playlist", error);
    }
  }, [user]);

  // Remove item from cloud playlist
  const removeFromCloudPlaylist = useCallback(async (track: Track) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("user_id", user.id)
        .eq("station_id", track.url);

      if (error) {
        logger.error("Error removing from cloud playlist", error);
      } else {
        logger.debug("Removed from cloud playlist", { name: track.name });
      }
    } catch (error) {
      logger.error("Error removing from cloud playlist", error);
    }
  }, [user]);

  // Clear cloud playlist
  const clearCloudPlaylist = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("playlists")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        logger.error("Error clearing cloud playlist", error);
      } else {
        logger.debug("Cleared cloud playlist");
      }
    } catch (error) {
      logger.error("Error clearing cloud playlist", error);
    }
  }, [user]);

  // Initial sync when user logs in
  useEffect(() => {
    if (user && lastSyncRef.current !== user.id) {
      lastSyncRef.current = user.id;
      syncFromCloud().then(() => {
        if (playlistTracks.length > 0) {
          syncPlaylistToCloud();
        }
      });
    }
  }, [user, syncFromCloud, syncPlaylistToCloud, playlistTracks.length]);

  return {
    syncPlaylistToCloud,
    syncFromCloud,
    addToCloudPlaylist,
    removeFromCloudPlaylist,
    clearCloudPlaylist,
  };
};
