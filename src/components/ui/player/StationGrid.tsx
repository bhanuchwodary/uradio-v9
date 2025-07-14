
import React, { memo, useMemo } from "react";
import { Track } from "@/types/track";
import { StationCard } from "@/components/ui/player/StationCard";
import { StationGridSkeleton } from "@/components/ui/skeleton/StationGridSkeleton";
import { logger } from "@/utils/logger";

interface StationGridProps {
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

export const StationGrid: React.FC<StationGridProps> = memo(({
  stations,
  currentIndex,
  currentTrackUrl,
  isPlaying,
  onSelectStation,
  onEditStation,
  onDeleteStation,
  onToggleFavorite,
  actionIcon = "play",
  context = "library",
  loading = false,
  isInPlaylist,
  isAddingToPlaylist = false
}) => {
  // Memoize station keys to prevent unnecessary re-renders
  const stationKeys = useMemo(() => 
    stations.map(station => `${station.url}-${station.name}-${station.language || 'unknown'}`),
    [stations]
  );

  // Show loading skeleton
  if (loading) {
    return <StationGridSkeleton count={12} />;
  }

  if (!stations || stations.length === 0) {
    return (
      <div className="text-center p-6 bg-gradient-to-br from-background/50 to-background/30 rounded-xl border border-border/50 backdrop-blur-sm">
        <p className="text-muted-foreground text-sm">No stations available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">{/* Improved gap spacing */}
      {stations.map((station, index) => {
        const isCurrentlyPlaying = station.url === currentTrackUrl && isPlaying;
        const isSelected = station.url === currentTrackUrl;
        const stationKey = stationKeys[index];
        const inPlaylist = isInPlaylist ? isInPlaylist(station.url) : false;
        
        // Removed excessive debug logging for performance
        
        return (
          <StationCard
            key={stationKey}
            station={station}
            isPlaying={isCurrentlyPlaying}
            isSelected={isSelected}
            onPlay={() => onSelectStation(index)}
            onEdit={onEditStation ? () => onEditStation(station) : undefined}
            onDelete={onDeleteStation ? () => onDeleteStation(station) : undefined}
            onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(station) : undefined}
            actionIcon={actionIcon}
            context={context}
            inPlaylist={inPlaylist}
            isAddingToPlaylist={isAddingToPlaylist}
          />
        );
      })}
    </div>
  );
}, (prevProps, nextProps) => {
  // Enhanced comparison for better performance
  if (prevProps.loading !== nextProps.loading) return false;
  if (prevProps.stations.length !== nextProps.stations.length) return false;
  if (prevProps.currentTrackUrl !== nextProps.currentTrackUrl) return false;
  if (prevProps.isPlaying !== nextProps.isPlaying) return false;
  if (prevProps.context !== nextProps.context) return false;
  if (prevProps.isAddingToPlaylist !== nextProps.isAddingToPlaylist) return false;
  
  // Deep comparison only when necessary
  return prevProps.stations.every((station, index) => {
    const nextStation = nextProps.stations[index];
    return nextStation &&
      station.url === nextStation.url &&
      station.name === nextStation.name &&
      station.isFavorite === nextStation.isFavorite &&
      station.language === nextStation.language;
  });
});

StationGrid.displayName = "StationGrid";
