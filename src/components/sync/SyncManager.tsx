import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSyncFavorites } from "@/hooks/useSyncFavorites";
import { useSyncPlaylists } from "@/hooks/useSyncPlaylists";
import { logger } from "@/utils/logger";

/**
 * Background component that handles syncing favorites and playlists
 * when a user is logged in. This component renders nothing visible
 * but manages the sync logic.
 */
export const SyncManager: React.FC = () => {
  const { user } = useAuth();
  const { syncFromCloud: syncFavoritesFromCloud, syncAllToCloud: syncFavoritesToCloud } = useSyncFavorites();
  const { syncFromCloud: syncPlaylistFromCloud, syncPlaylistToCloud } = useSyncPlaylists();

  useEffect(() => {
    if (user) {
      logger.info("User logged in, starting sync", { userId: user.id });
    } else {
      logger.info("User logged out, sync disabled");
    }
  }, [user]);

  // The sync hooks handle their own sync logic on user change
  // This component just ensures they're mounted when needed
  
  return null;
};

export default SyncManager;
