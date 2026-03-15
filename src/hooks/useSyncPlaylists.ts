import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { usePlaylist, PlaylistTrack } from "@/context/PlaylistContext";
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
  const { playlistTracks, addToPlaylist, removeFromPlaylist, clearPlaylist } = usePlaylist();
  const { toast } = useToast();
  const isSyncing = useRef(false);
  const lastSyncRef = useRef<string | null>(null);

  // Sync playlist from cloud to local (merge: add cloud tracks not already local)
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
        const cloudTracks: Track[] = (cloudPlaylist as DbPlaylistItem[]).map((item) => ({
          url: item.station_url,
          name: item.station_name,
          language: item.station_genre || undefined,
          isFavorite: false,
          isFeatured: false,
          playTime: 0,
        }));

        const existingUrls = new Set(playlistTracks.map(t => t.url.toLowerCase().trim()));
        let addedCount = 0;
        cloudTracks.forEach(track => {
          if (!existingUrls.has(track.url.toLowerCase().trim())) {
            addToPlaylist(track);
            addedCount++;
          }
        });

        if (addedCount > 0) {
          logger.info("Synced playlist from cloud", { addedCount, totalCloud: cloudPlaylist.length });
          toast({
            title: "Playlist synced",
            description: `${addedCount} station(s) loaded from cloud.`,
          });
        }
      }
    } catch (error) {
      logger.error("Error syncing playlist from cloud", error);
    } finally {
      isSyncing.current = false;
    }
  }, [user, playlistTracks, addToPlaylist, toast]);

  // Sync entire local playlist to cloud (replaces cloud data)
  const syncPlaylistToCloud = useCallback(async () => {
    if (!user) return;

    try {
      // Delete existing cloud playlist
      await supabase
        .from("playlists")
        .delete()
        .eq("user_id", user.id);

      if (playlistTracks.length === 0) {
        logger.debug("Cloud playlist cleared (local is empty)");
        return;
      }

      // Insert all current playlist items
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
  };
};
