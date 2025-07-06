
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
        "transform hover:scale-[1.02] active:scale-95 border-0 backdrop-blur-md elevation-2 hover:elevation-4",
        "hover:shadow-2xl hover:-translate-y-2 aspect-square rounded-3xl",
        "bg-gradient-to-br shadow-lg transition-all duration-300 ease-out",
        isSelected 
          ? "from-primary/25 via-primary/15 to-primary/5 ring-2 ring-primary/40 shadow-primary/20" 
          : inPlaylist && actionIcon === "add"
          ? "from-emerald-500/15 via-emerald-500/8 to-emerald-500/3 ring-1 ring-emerald-500/30 shadow-emerald-500/10"
          : isProcessing
          ? "from-blue-500/15 via-blue-500/8 to-blue-500/3 ring-1 ring-blue-500/30 shadow-blue-500/10"
          : "from-surface-container-high/90 via-surface-container/70 to-surface-container-low/50 hover:from-secondary-container/60 hover:via-secondary-container/40 hover:to-secondary-container/20",
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
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
              "bg-surface-container-highest/90 backdrop-blur-md shadow-lg border border-outline-variant/20",
              "active:scale-90 touch-manipulation hover:scale-110",
              station.isFavorite 
                ? "text-amber-500 bg-amber-500/10 border-amber-500/30 shadow-amber-500/20" 
                : "text-on-surface-variant hover:text-amber-500 hover:bg-amber-500/5"
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
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
              "bg-surface-container-highest/90 backdrop-blur-md shadow-lg border border-outline-variant/20",
              "active:scale-90 touch-manipulation hover:scale-110",
              "text-error hover:bg-error/10 hover:border-error/30 hover:shadow-error/20"
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
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
              "bg-surface-container-highest/90 backdrop-blur-md shadow-lg border border-outline-variant/20",
              "active:scale-90 touch-manipulation hover:scale-110",
              "text-blue-600 hover:bg-blue-500/10 hover:border-blue-500/30 hover:shadow-blue-500/20"
            )}
            aria-label="Edit station"
          >
            <Edit className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="p-4 flex flex-col items-center justify-center h-full min-h-[160px] relative">
        {/* Ambient Background Glow */}
        <div className={cn(
          "absolute inset-0 rounded-3xl transition-opacity duration-500",
          isSelected && "bg-gradient-to-br from-primary/5 to-primary/0 animate-pulse"
        )} />
        
        {/* Centered Play Button */}
        <div className="flex-1 flex items-center justify-center mb-2 relative z-10">
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
        <div className="w-full mt-auto relative z-10">
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
