import React, { memo, useMemo, useCallback, useState, useRef, useEffect } from "react";
import { Track } from "@/types/track";
import { StationCard } from "@/components/ui/player/StationCard";
import { useAppPerformance } from "@/hooks/useAppPerformance";

interface VirtualizedStationGridProps {
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
  isInPlaylist?: (trackUrl: string) => boolean;
  isAddingToPlaylist?: boolean;
  itemsPerRow?: number;
  containerHeight?: number;
}

const ITEM_HEIGHT = 140; // Approximate height of station card
const OVERSCAN = 5; // Number of items to render outside visible area

export const VirtualizedStationGrid: React.FC<VirtualizedStationGridProps> = memo(({
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
  isInPlaylist,
  isAddingToPlaylist = false,
  itemsPerRow = 3,
  containerHeight = 400
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { getMetrics } = useAppPerformance("VirtualizedStationGrid", [stations.length, scrollTop]);

  // Calculate visible range
  const { startIndex, endIndex, totalRows } = useMemo(() => {
    const rowCount = Math.ceil(stations.length / itemsPerRow);
    const visibleRowCount = Math.ceil(containerHeight / ITEM_HEIGHT);
    const startRow = Math.floor(scrollTop / ITEM_HEIGHT);
    const endRow = Math.min(startRow + visibleRowCount + OVERSCAN, rowCount);
    
    return {
      startIndex: Math.max(0, startRow * itemsPerRow),
      endIndex: Math.min(endRow * itemsPerRow, stations.length),
      totalRows: rowCount
    };
  }, [stations.length, itemsPerRow, containerHeight, scrollTop]);

  // Get visible stations
  const visibleStations = useMemo(() => 
    stations.slice(startIndex, endIndex),
    [stations, startIndex, endIndex]
  );

  // Handle scroll with throttling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    setIsScrolling(true);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Set scrolling to false after scroll ends
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Calculate grid styles based on screen size
  const gridCols = useMemo(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 2; // mobile
      if (window.innerWidth < 768) return 3; // sm
      if (window.innerWidth < 1024) return 4; // md
      if (window.innerWidth < 1280) return 5; // lg
      return 6; // xl
    }
    return itemsPerRow;
  }, [itemsPerRow]);

  if (!stations || stations.length === 0) {
    return (
      <div className="text-center p-6 bg-surface-container/50 rounded-xl border border-outline-variant/50">
        <p className="text-on-surface-variant text-sm">No stations available</p>
      </div>
    );
  }

  const totalHeight = totalRows * ITEM_HEIGHT;
  const offsetY = Math.floor(startIndex / itemsPerRow) * ITEM_HEIGHT;

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto scroll-smooth"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          className={`grid gap-3 sm:gap-4 absolute w-full`}
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            transform: `translateY(${offsetY}px)`
          }}
        >
          {visibleStations.map((station, index) => {
            const actualIndex = startIndex + index;
            const isCurrentlyPlaying = station.url === currentTrackUrl && isPlaying;
            const isSelected = station.url === currentTrackUrl;
            const inPlaylist = isInPlaylist ? isInPlaylist(station.url) : false;
            
            return (
              <StationCard
                key={`${station.url}-${station.name}`}
                station={station}
                isPlaying={isCurrentlyPlaying}
                isSelected={isSelected}
                onPlay={() => onSelectStation(actualIndex)}
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
      </div>
    </div>
  );
});

VirtualizedStationGrid.displayName = "VirtualizedStationGrid";