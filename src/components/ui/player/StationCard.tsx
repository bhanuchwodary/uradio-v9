
import React, { memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StationCardButton } from "./StationCardButton";
import { StationCardInfo } from "./StationCardInfo";
import { StationCardActions } from "./StationCardActions";
import { StationCardProps } from "./types";
import { logger } from "@/utils/logger";

export const StationCard: React.FC<StationCardProps> = memo(({
  station,
  isPlaying,
  isSelected,
  onPlay,
  onEdit,
  onDelete,
  onToggleFavorite,
  actionIcon = "play",
  context = "library",
  inPlaylist = false,
  isAddingToPlaylist = false
}) => {
  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    logger.debug("StationCard interaction", { 
      stationName: station.name, 
      actionIcon, 
      context, 
      inPlaylist, 
      isAddingToPlaylist 
    });
    
    // Prevent adding to playlist if already in playlist or currently being added
    if (actionIcon === "add" && (inPlaylist || isAddingToPlaylist)) {
      logger.debug("StationCard click blocked", { reason: "already in playlist or being added" });
      return;
    }
    
    // Always call onPlay for playback actions
    if (actionIcon === "play" || context === "playlist") {
      logger.debug("StationCard triggering playback", { stationName: station.name });
      onPlay();
    } else if (actionIcon === "add" && !inPlaylist) {
      logger.debug("StationCard adding to playlist", { stationName: station.name });
      onPlay(); // This will handle adding to playlist in the parent
    }
  }, [actionIcon, context, inPlaylist, isAddingToPlaylist, onPlay, station.name]);

  // Check if the station is being processed
  const isProcessing = actionIcon === "add" && isAddingToPlaylist;
  const isDisabled = actionIcon === "add" && (inPlaylist || isProcessing);

  return (
    <Card 
      className={cn(
        "relative overflow-hidden group material-transition cursor-pointer h-full ios-touch-target",
        "transform hover:scale-105 active:scale-95 border-0 backdrop-blur-sm elevation-1 hover:elevation-3",
        "hover:shadow-xl hover:-translate-y-1",
        isSelected 
          ? "bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg ring-2 ring-primary/30" 
          : inPlaylist && actionIcon === "add"
          ? "bg-gradient-to-br from-green-500/10 to-green-500/5 shadow-md ring-1 ring-green-500/20"
          : isProcessing
          ? "bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-md ring-1 ring-blue-500/20"
          : "bg-gradient-to-br from-surface-container/80 to-surface-container/60 hover:from-accent/40 hover:to-accent/20",
        // Disable hover effects if already in playlist or being processed
        isDisabled && "hover:scale-100 cursor-default"
      )}
      onClick={handlePlayClick}
      role="button"
      tabIndex={0}
      aria-label={`${actionIcon === "add" ? "Add" : "Play"} ${station.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handlePlayClick(e as any);
        }
      }}
    >
      <div className="px-1.5 py-2 flex flex-col items-center space-y-1 h-full min-h-[120px]">
        {/* Play Button */}
        <StationCardButton
          station={station}
          isPlaying={isPlaying}
          isSelected={isSelected}
          actionIcon={actionIcon}
          context={context}
          inPlaylist={inPlaylist}
          isAddingToPlaylist={isProcessing}
          onClick={handlePlayClick}
          isDisabled={isDisabled}
          isProcessing={isProcessing}
        />
        
        {/* Station Info */}
        <StationCardInfo
          station={station}
          isSelected={isSelected}
          inPlaylist={inPlaylist}
          isProcessing={isProcessing}
          actionIcon={actionIcon}
        />
        
        {/* Action Buttons */}
        <StationCardActions
          station={station}
          context={context}
          onToggleFavorite={onToggleFavorite}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </Card>
  );
}, (prevProps, nextProps) => {
  // Enhanced comparison for better performance
  return (
    prevProps.station.url === nextProps.station.url &&
    prevProps.station.name === nextProps.station.name &&
    prevProps.station.language === nextProps.station.language &&
    prevProps.isPlaying === nextProps.isPlaying &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.station.isFavorite === nextProps.station.isFavorite &&
    prevProps.context === nextProps.context &&
    prevProps.actionIcon === nextProps.actionIcon &&
    prevProps.inPlaylist === nextProps.inPlaylist
  );
});

StationCard.displayName = "StationCard";
