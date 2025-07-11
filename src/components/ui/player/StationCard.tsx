
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
        "relative overflow-hidden group smooth-animation cursor-pointer h-full ios-touch-target rounded-3xl",
        "transform hover:scale-[1.03] active:scale-95 border-0 backdrop-blur-sm elevation-1 hover:elevation-4",
        "hover:shadow-2xl hover:-translate-y-2 aspect-square modern-card modern-card-hover",
        isSelected 
          ? "bg-gradient-to-br from-primary/25 to-primary/15 shadow-xl ring-2 ring-primary/40 scale-[1.02]" 
          : inPlaylist && actionIcon === "add"
          ? "bg-gradient-to-br from-green-500/15 to-green-500/8 shadow-lg ring-1 ring-green-500/30"
          : isProcessing
          ? "bg-gradient-to-br from-blue-500/15 to-blue-500/8 shadow-lg ring-1 ring-blue-500/30 animate-pulse"
          : "bg-gradient-to-br from-surface-container/90 to-surface-container/70 gradient-hover",
        // Disable hover effects if already in playlist or being processed
        isDisabled && "hover:scale-100 cursor-default opacity-70"
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
              "w-8 h-8 rounded-full flex items-center justify-center smooth-animation elevation-1 hover:elevation-2",
              "bg-surface-container/90 backdrop-blur-sm shadow-md",
              "active:scale-90 touch-manipulation hover:scale-110",
              station.isFavorite 
                ? "text-yellow-500 bg-yellow-500/20 shadow-yellow-500/20" 
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
              "w-8 h-8 rounded-full flex items-center justify-center smooth-animation elevation-1 hover:elevation-2",
              "bg-surface-container/90 backdrop-blur-sm shadow-md",
              "active:scale-90 touch-manipulation hover:scale-110",
              "text-destructive hover:bg-destructive/20 hover:text-destructive"
            )}
            aria-label={context === "playlist" ? "Remove from playlist" : "Delete station"}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Edit Button - Top Right, positioned differently when delete exists */}
      {onEdit && !station.isFeatured && (
        <div className={cn(
          "absolute z-10",
          onDelete ? "top-12 right-2" : "top-2 right-2"
        )}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center smooth-animation elevation-1 hover:elevation-2",
              "bg-surface-container/90 backdrop-blur-sm shadow-md",
              "active:scale-90 touch-manipulation hover:scale-110",
              "text-blue-500 hover:bg-blue-500/20 hover:text-blue-600"
            )}
            aria-label="Edit station"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="p-3 flex flex-col items-center justify-center h-full min-h-[160px] smooth-animation">
        {/* Centered Play Button */}
        <div className="flex-1 flex items-center justify-center mb-2">
          <div className="bounce-in">
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
        </div>
        
        {/* Station Info - Bottom with proper spacing */}
        <div className="w-full mt-auto px-2 space-y-1">
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
