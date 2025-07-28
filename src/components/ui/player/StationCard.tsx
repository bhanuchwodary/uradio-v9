
import React, { memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Star, Trash2, Edit } from "lucide-react";
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
        "relative overflow-hidden group modern-card cursor-pointer h-full ios-touch-target",
        "interactive-scale aspect-square border-0",
        isSelected 
          ? "bg-gradient-to-br from-primary-container/40 to-primary-container/20 ring-2 ring-primary/40 elevation-primary-2" 
          : inPlaylist && actionIcon === "add"
          ? "bg-gradient-to-br from-green-500/15 to-green-500/5 ring-1 ring-green-500/30 elevation-2"
          : isProcessing
          ? "bg-gradient-to-br from-blue-500/15 to-blue-500/5 ring-1 ring-blue-500/30 elevation-2"
          : "glass-card hover:bg-gradient-to-br hover:from-secondary-container/30 hover:to-secondary-container/10",
        // Disable hover effects if already in playlist or being processed
        isDisabled && "hover:scale-100 cursor-default opacity-75"
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
      {/* Favorite Button - Top Left */}
      {onToggleFavorite && (
        <div className="absolute top-2 left-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center material-transition-fast elevation-1",
              "glass-surface button-press-effect",
              "hover:elevation-2",
              station.isFavorite 
                ? "text-yellow-500 bg-yellow-500/20 ring-1 ring-yellow-500/30" 
                : "text-on-surface-variant hover:text-yellow-500 hover:bg-yellow-500/10"
            )}
            aria-label={station.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={cn("h-3.5 w-3.5", station.isFavorite && "fill-current")} />
          </button>
        </div>
      )}

      {/* Delete Button - Top Right */}
      {onDelete && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center material-transition-fast elevation-1",
              "glass-surface button-press-effect hover:elevation-2",
              "text-error hover:text-error/80 hover:bg-error/10"
            )}
            aria-label={context === "playlist" ? "Remove from playlist" : "Delete station"}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Edit Button - Top Right (when no delete) */}
      {onEdit && !onDelete && !station.isFeatured && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center material-transition-fast elevation-1",
              "glass-surface button-press-effect hover:elevation-2",
              "text-on-surface-variant hover:text-on-surface hover:bg-on-surface/10"
            )}
            aria-label="Edit station"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="p-3 flex flex-col items-center justify-center h-full min-h-[140px]">
        {/* Centered Play Button */}
        <div className="flex-1 flex items-center justify-center mb-1">
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
        </div>
        
        {/* Station Info - Bottom */}
        <div className="w-full mt-auto">
          <StationCardInfo
            station={station}
            isSelected={isSelected}
            inPlaylist={inPlaylist}
            isProcessing={isProcessing}
            actionIcon={actionIcon}
          />
        </div>
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
