import React, { memo, useCallback, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StationCardButton } from "@/components/ui/player/StationCardButton";
import { StationCardInfo } from "@/components/ui/player/StationCardInfo";
import { StationCardActions } from "@/components/ui/player/StationCardActions";
import { StationCardProps } from "@/components/ui/player/types";

export const TouchOptimizedCard: React.FC<StationCardProps> = memo(({
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
  const [isPressed, setIsPressed] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout>();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    setIsPressed(true);

    // Clear any existing timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    // Set up long press detection
    longPressTimerRef.current = setTimeout(() => {
      // Handle long press (could show context menu)
      setIsPressed(false);
    }, 800);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }

    if (touchStartRef.current) {
      const touch = e.changedTouches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Only trigger if it's a tap (not drag) and not too long
      if (deltaX < 10 && deltaY < 10 && deltaTime < 800) {
        handlePlayClick(e as any);
      }
    }

    setIsPressed(false);
    touchStartRef.current = null;
  }, []);

  const handleTouchCancel = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    setIsPressed(false);
    touchStartRef.current = null;
  }, []);

  const handlePlayClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    
    // Prevent adding to playlist if already in playlist or currently being added
    if (actionIcon === "add" && (inPlaylist || isAddingToPlaylist)) {
      return;
    }
    
    // Always call onPlay for playback actions
    if (actionIcon === "play" || context === "playlist") {
      onPlay();
    } else if (actionIcon === "add" && !inPlaylist) {
      onPlay(); // This will handle adding to playlist in the parent
    }
  }, [actionIcon, context, inPlaylist, isAddingToPlaylist, onPlay]);

  // Check if the station is being processed
  const isProcessing = actionIcon === "add" && isAddingToPlaylist;
  const isDisabled = actionIcon === "add" && (inPlaylist || isProcessing);

  return (
    <Card 
      className={cn(
        "relative overflow-hidden group transition-all duration-200 cursor-pointer h-full",
        "border-0 backdrop-blur-sm elevation-1 aspect-square",
        // Enhanced touch feedback
        "active:scale-95 touch-manipulation",
        // Better mobile styling
        "min-h-[140px] sm:min-h-[160px]",
        // State-based styling
        isPressed && "scale-95 brightness-90",
        isSelected 
          ? "bg-gradient-to-br from-primary/20 to-primary/10 shadow-lg ring-2 ring-primary/30" 
          : inPlaylist && actionIcon === "add"
          ? "bg-gradient-to-br from-green-500/10 to-green-500/5 shadow-md ring-1 ring-green-500/20"
          : isProcessing
          ? "bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-md ring-1 ring-blue-500/20"
          : "bg-gradient-to-br from-surface-container/80 to-surface-container/60 hover:from-accent/40 hover:to-accent/20",
        // Disable interactions if disabled
        isDisabled && "cursor-default opacity-60"
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onClick={handlePlayClick}
      role="button"
      tabIndex={0}
      aria-label={`${actionIcon === "add" ? "Add" : "Play"} ${station.name}`}
    >
      <div className="p-3 flex flex-col items-center justify-center h-full relative">
        {/* Favorite Button - Top Left */}
        {onToggleFavorite && (
          <div className="absolute top-2 left-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                "bg-surface-container/80 backdrop-blur-sm shadow-sm",
                "active:scale-90 touch-manipulation",
                station.isFavorite 
                  ? "text-yellow-500 bg-yellow-500/10" 
                  : "text-on-surface-variant hover:text-yellow-500"
              )}
              aria-label={station.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <svg className={cn("h-4 w-4", station.isFavorite && "fill-current")} viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
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
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                "bg-surface-container/80 backdrop-blur-sm shadow-sm",
                "active:scale-90 touch-manipulation",
                "text-destructive hover:bg-destructive/10"
              )}
              aria-label={context === "playlist" ? "Remove from playlist" : "Delete station"}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2"/>
              </svg>
            </button>
          </div>
        )}
        
        {/* Main Play Button - Centered */}
        <div className="flex-1 flex items-center justify-center mb-2">
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
});

TouchOptimizedCard.displayName = "TouchOptimizedCard";