
import React, { memo, useCallback } from "react";
import { StationCard } from "@/components/ui/player/StationCard";
import { Track } from "@/types/track";

interface OptimizedStationCardProps {
  station: Track;
  isPlaying: boolean;
  isSelected: boolean;
  onPlay: (station: Track) => void;
  onEdit: (station: Track) => void;
  onDelete: (station: Track) => void;
  onToggleFavorite: (station: Track) => void;
  context?: "playlist" | "library";
}

const OptimizedStationCard = memo<OptimizedStationCardProps>(({
  station,
  isPlaying,
  isSelected,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite,
  context = "library"
}) => {
  // Memoize callbacks to prevent unnecessary re-renders
  const handlePlay = useCallback(() => {
    onPlay(station);
  }, [onPlay, station]);

  const handleEdit = useCallback(() => {
    onEdit(station);
  }, [onEdit, station]);

  const handleDelete = useCallback(() => {
    onDelete(station);
  }, [onDelete, station]);

  const handleToggleFavorite = useCallback(() => {
    onToggleFavorite(station);
  }, [onToggleFavorite, station]);

  return (
    <StationCard
      station={station}
      isPlaying={isPlaying}
      isSelected={isSelected}
      onPlay={handlePlay}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onToggleFavorite={handleToggleFavorite}
      context={context}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.station.url === nextProps.station.url &&
    prevProps.station.name === nextProps.station.name &&
    prevProps.station.isFavorite === nextProps.station.isFavorite &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.context === nextProps.context
  );
});

OptimizedStationCard.displayName = "OptimizedStationCard";

export { OptimizedStationCard };
