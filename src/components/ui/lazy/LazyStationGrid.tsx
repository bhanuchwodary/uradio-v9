import React, { lazy, Suspense, memo } from "react";
import { StationGridSkeleton } from "@/components/ui/skeleton/StationGridSkeleton";
import { useMemoryOptimization } from "@/hooks/useMemoryOptimization";
import { Track } from "@/types/track";

// Lazy load the heavy StationGrid component
const StationGrid = lazy(() => 
  import("@/components/ui/player/StationGrid").then(module => ({
    default: module.StationGrid
  }))
);

interface LazyStationGridProps {
  stations: Track[];
  currentIndex: number;
  currentTrackUrl?: string;
  isPlaying: boolean;
  onSelectStation: (index: number) => void;
  onEditStation?: (station: Track) => void;
  onDeleteStation?: (station: Track) => void;
  onToggleFavorite?: (station: Track) => void;
  actionIcon?: "play" | "add";
  context?: "playlist" | "library";
  loading?: boolean;
  isInPlaylist?: (trackUrl: string) => boolean;
  isAddingToPlaylist?: boolean;
}

export const LazyStationGrid: React.FC<LazyStationGridProps> = memo((props) => {
  const { registerCleanup } = useMemoryOptimization("LazyStationGrid");

  // Register cleanup for any heavy operations
  React.useEffect(() => {
    registerCleanup(() => {
      // Any cleanup specific to station grid
    });
  }, [registerCleanup]);

  return (
    <Suspense fallback={<StationGridSkeleton count={12} />}>
      <StationGrid {...props} />
    </Suspense>
  );
});

LazyStationGrid.displayName = "LazyStationGrid";