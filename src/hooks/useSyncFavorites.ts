import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useTrackStateContext } from "@/context/TrackStateContext";
import { Track } from "@/types/track";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";

interface DbFavorite {
  id: string;
  user_id: string;
  station_id: string;
  station_name: string;
  station_url: string;
  station_logo: string | null;
  station_genre: string | null;
  created_at: string;
}

export const useSyncFavorites = () => {
  const { user } = useAuth();
  const { tracks, toggleFavorite } = useTrackStateContext();
  const { toast } = useToast();
  const isSyncing = useRef(false);
  const lastSyncRef = useRef<string | null>(null);

  // Sync favorites from cloud to local
  const syncFromCloud = useCallback(async () => {
    if (!user || isSyncing.current) return;

    isSyncing.current = true;
    try {
      const { data: cloudFavorites, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        logger.error("Error fetching cloud favorites", error);
        return;
      }

      // Find local tracks that should be marked as favorites from cloud
      if (cloudFavorites && cloudFavorites.length > 0) {
        const cloudUrls = new Set((cloudFavorites as DbFavorite[]).map(f => f.station_url));
        
        tracks.forEach((track, index) => {
          const isCloudFavorite = cloudUrls.has(track.url);
          if (isCloudFavorite && !track.isFavorite) {
            toggleFavorite(index);
          }
        });

        logger.debug("Synced favorites from cloud", { count: cloudFavorites.length });
      }
    } catch (error) {
      logger.error("Error syncing favorites from cloud", error);
    } finally {
      isSyncing.current = false;
    }
  }, [user, tracks, toggleFavorite]);

  // Sync a single favorite to cloud
  const syncFavoriteToCloud = useCallback(async (track: Track, isFavorite: boolean) => {
    if (!user) return;

    try {
      if (isFavorite) {
        // Add to cloud favorites
        const { error } = await supabase.from("favorites").upsert({
          user_id: user.id,
          station_id: track.url, // Using URL as unique ID
          station_name: track.name,
          station_url: track.url,
          station_logo: null,
          station_genre: track.language || null,
        }, {
          onConflict: "user_id,station_id"
        });

        if (error) {
          logger.error("Error adding favorite to cloud", error);
        } else {
          logger.debug("Added favorite to cloud", { name: track.name });
        }
      } else {
        // Remove from cloud favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("station_id", track.url);

        if (error) {
          logger.error("Error removing favorite from cloud", error);
        } else {
          logger.debug("Removed favorite from cloud", { name: track.name });
        }
      }
    } catch (error) {
      logger.error("Error syncing favorite to cloud", error);
    }
  }, [user]);

  // Sync all local favorites to cloud on login
  const syncAllToCloud = useCallback(async () => {
    if (!user) return;

    const favorites = tracks.filter(t => t.isFavorite);
    if (favorites.length === 0) return;

    try {
      const favoritesData = favorites.map(track => ({
        user_id: user.id,
        station_id: track.url,
        station_name: track.name,
        station_url: track.url,
        station_logo: null,
        station_genre: track.language || null,
      }));

      const { error } = await supabase
        .from("favorites")
        .upsert(favoritesData, { onConflict: "user_id,station_id" });

      if (error) {
        logger.error("Error syncing all favorites to cloud", error);
      } else {
        logger.debug("Synced all favorites to cloud", { count: favorites.length });
        toast({
          title: "Favorites synced",
          description: `${favorites.length} favorite(s) synced to cloud.`,
        });
      }
    } catch (error) {
      logger.error("Error syncing all favorites to cloud", error);
    }
  }, [user, tracks, toast]);

  // Initial sync when user logs in
  useEffect(() => {
    if (user && lastSyncRef.current !== user.id) {
      lastSyncRef.current = user.id;
      // Sync from cloud first, then push local favorites
      syncFromCloud().then(() => syncAllToCloud());
    }
  }, [user, syncFromCloud, syncAllToCloud]);

  return { syncFavoriteToCloud, syncFromCloud, syncAllToCloud };
};
