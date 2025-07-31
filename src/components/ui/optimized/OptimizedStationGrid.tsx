import React, { memo, useMemo, useCallback } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { Track } from "@/types/track";
import { StationCard } from "@/components/ui/player/StationCard";
import { StationGridSkeleton } from "@/components/ui/skeleton/StationGridSkeleton";
import { useOptimizedPerformance } from "@/hooks/useOptimizedPerformance";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface OptimizedStationGridProps {
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
  className?: string;
}

const CARD_HEIGHT = 140;
const GAP = 12;

// Memoized cell component for virtual grid
const GridCell = memo<{
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    stations: Track[];
    columnsPerRow: number;
    onSelectStation: (index: number) => void;
    onEditStation?: (station: Track) => void;
    onDeleteStation?: (station: Track) => void;
    onToggleFavorite?: (station: Track) => void;
    currentTrackUrl?: string;
    isPlaying: boolean;
    actionIcon: "play" | "add";
    context: "playlist" | "library";
    isInPlaylist?: (trackUrl: string) => boolean;
    isAddingToPlaylist: boolean;
  };
}>(({ columnIndex, rowIndex, style, data }) => {
  const {
    stations,
    columnsPerRow,
    onSelectStation,
    onEditStation,
    onDeleteStation,
    onToggleFavorite,
    currentTrackUrl,
    isPlaying,
    actionIcon,
    context,
    isInPlaylist,
    isAddingToPlaylist
  } = data;

  const stationIndex = rowIndex * columnsPerRow + columnIndex;
  const station = stations[stationIndex];

  if (!station) {
    return <div style={style} />;
  }

  const isCurrentlyPlaying = station.url === currentTrackUrl && isPlaying;
  const isSelected = station.url === currentTrackUrl;
  const inPlaylist = isInPlaylist ? isInPlaylist(station.url) : false;

  return (
    <div style={style} className="p-1.5">
      <StationCard
        station={station}
        isPlaying={isCurrentlyPlaying}
        isSelected={isSelected}
        onPlay={() => onSelectStation(stationIndex)}
        onEdit={onEditStation ? () => onEditStation(station) : undefined}
        onDelete={onDeleteStation ? () => onDeleteStation(station) : undefined}
        onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(station) : undefined}
        actionIcon={actionIcon}
        context={context}
        inPlaylist={inPlaylist}
        isAddingToPlaylist={isAddingToPlaylist}
      />
    </div>
  );
});

GridCell.displayName = "GridCell";

export const OptimizedStationGrid: React.FC<OptimizedStationGridProps> = memo(({
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
  isAddingToPlaylist = false,
  className
}) => {
  const { setRef, isVisible } = useOptimizedPerformance('OptimizedStationGrid', [stations.length, isPlaying]);
  const isMobile = useIsMobile();

  // Calculate grid dimensions based on screen size
  const { columnsPerRow, containerWidth } = useMemo(() => {
    if (typeof window === 'undefined') return { columnsPerRow: 4, containerWidth: 800 };
    
    const width = window.innerWidth;
    let columns = 6; // Default for xl screens
    
    if (width < 640) columns = 2; // sm
    else if (width < 768) columns = 3; // md
    else if (width < 1024) columns = 4; // lg
    else if (width < 1280) columns = 5; // xl
    
    return { 
      columnsPerRow: columns, 
      containerWidth: Math.min(width - 32, 1200) // Max width with padding
    };
  }, []);

  const columnWidth = useMemo(() => {
    return (containerWidth - (GAP * (columnsPerRow - 1))) / columnsPerRow;
  }, [containerWidth, columnsPerRow]);

  const rowCount = useMemo(() => {
    return Math.ceil(stations.length / columnsPerRow);
  }, [stations.length, columnsPerRow]);

  const gridData = useMemo(() => ({
    stations,
    columnsPerRow,
    onSelectStation,
    onEditStation,
    onDeleteStation,
    onToggleFavorite,
    currentTrackUrl,
    isPlaying,
    actionIcon,
    context,
    isInPlaylist,
    isAddingToPlaylist
  }), [
    stations,
    columnsPerRow,
    onSelectStation,
    onEditStation,
    onDeleteStation,
    onToggleFavorite,
    currentTrackUrl,
    isPlaying,
    actionIcon,
    context,
    isInPlaylist,
    isAddingToPlaylist
  ]);

  // Show loading skeleton
  if (loading) {
    return <StationGridSkeleton count={12} />;
  }

  if (!stations || stations.length === 0) {
    return (
      <div className="text-center p-6 bg-gradient-to-br from-surface-container-lowest/50 to-surface-container/30 rounded-xl border border-outline-variant/50 backdrop-blur-sm">
        <p className="text-on-surface-variant text-sm">No stations available</p>
      </div>
    );
  }

  // Use regular grid for small station counts
  if (stations.length < 20) {
    return (
      <div 
        ref={setRef}
        className={cn(
          "grid gap-3 sm:gap-4",
          "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
          className
        )}
      >
        {stations.map((station, index) => {
          const isCurrentlyPlaying = station.url === currentTrackUrl && isPlaying;
          const isSelected = station.url === currentTrackUrl;
          const inPlaylist = isInPlaylist ? isInPlaylist(station.url) : false;
          
          return (
            <StationCard
              key={`${station.url}-${station.name}`}
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
  }

  // Use virtualized grid for large station counts (performance optimization)
  return (
    <div ref={setRef} className={cn("w-full", className)}>
      {isVisible && (
        <Grid
          columnCount={columnsPerRow}
          columnWidth={columnWidth}
          height={Math.min(600, rowCount * (CARD_HEIGHT + GAP))} // Max height with fallback
          rowCount={rowCount}
          rowHeight={CARD_HEIGHT + GAP}
          itemData={gridData}
          overscanRowCount={2}
          overscanColumnCount={1}
          style={{
            marginLeft: -GAP / 2,
            marginRight: -GAP / 2,
          }}
        >
          {GridCell}
        </Grid>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Enhanced memoization comparison
  if (prevProps.loading !== nextProps.loading) return false;
  if (prevProps.stations.length !== nextProps.stations.length) return false;
  if (prevProps.currentTrackUrl !== nextProps.currentTrackUrl) return false;
  if (prevProps.isPlaying !== nextProps.isPlaying) return false;
  if (prevProps.context !== nextProps.context) return false;
  if (prevProps.isAddingToPlaylist !== nextProps.isAddingToPlaylist) return false;
  
  // Deep comparison for station changes
  return prevProps.stations.every((station, index) => {
    const nextStation = nextProps.stations[index];
    return nextStation &&
      station.url === nextStation.url &&
      station.name === nextStation.name &&
      station.isFavorite === nextStation.isFavorite;
  });
});

OptimizedStationGrid.displayName = "OptimizedStationGrid";