
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
        "relative overflow-hidden group material-transition cursor-pointer h-full ios-touch-target",
        "transform hover:scale-105 active:scale-95 border-0 backdrop-blur-sm elevation-1 hover:elevation-3",
        "hover:shadow-xl hover:-translate-y-1 aspect-square",
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
      {/* Favorite Button - Top Left */}
      {onToggleFavorite && (
        <div className="absolute top-2 left-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200",
              "bg-surface-container/80 backdrop-blur-sm shadow-sm",
              "active:scale-90 touch-manipulation",
              station.isFavorite 
                ? "text-yellow-500 bg-yellow-500/10" 
                : "text-on-surface-variant hover:text-yellow-500"
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
              "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200",
              "bg-surface-container/80 backdrop-blur-sm shadow-sm",
              "active:scale-90 touch-manipulation",
              "text-destructive hover:bg-destructive/10"
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
              "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200",
              "bg-surface-container/80 backdrop-blur-sm shadow-sm",
              "active:scale-90 touch-manipulation",
              "text-blue-500 hover:bg-blue-500/10"
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
