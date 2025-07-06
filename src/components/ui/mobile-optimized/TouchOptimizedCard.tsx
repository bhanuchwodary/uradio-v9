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
        "relative overflow-hidden group transition-all duration-300 cursor-pointer h-full",
        "border-0 backdrop-blur-md elevation-2 aspect-square rounded-3xl",
        // Enhanced touch feedback
        "active:scale-95 touch-manipulation hover:elevation-4",
        // Better mobile styling
        "min-h-[160px] sm:min-h-[180px] shadow-lg",
        // State-based styling with improved gradients
        "bg-gradient-to-br transition-all duration-300 ease-out",
        // Enhanced press state
        isPressed && "scale-95 brightness-95 shadow-2xl",
        isSelected 
          ? "from-primary/25 via-primary/15 to-primary/5 ring-2 ring-primary/40 shadow-primary/20" 
          : inPlaylist && actionIcon === "add"
          ? "from-emerald-500/15 via-emerald-500/8 to-emerald-500/3 ring-1 ring-emerald-500/30 shadow-emerald-500/10"
          : isProcessing
          ? "from-blue-500/15 via-blue-500/8 to-blue-500/3 ring-1 ring-blue-500/30 shadow-blue-500/10"
          : "from-surface-container-high/90 via-surface-container/70 to-surface-container-low/50 hover:from-secondary-container/60 hover:via-secondary-container/40 hover:to-secondary-container/20",
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
      <div className="p-4 flex flex-col items-center justify-center h-full relative">
        {/* Ambient Background Glow */}
        <div className={cn(
          "absolute inset-0 rounded-3xl transition-opacity duration-500",
          isSelected && "bg-gradient-to-br from-primary/5 to-primary/0 animate-pulse"
        )} />
        
        {/* Favorite Button - Top Left */}
        {onToggleFavorite && (
          <div className="absolute top-3 left-3 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                "bg-surface-container-highest/90 backdrop-blur-md shadow-lg border border-outline-variant/20",
                "active:scale-90 touch-manipulation hover:scale-110",
                station.isFavorite 
                  ? "text-amber-500 bg-amber-500/10 border-amber-500/30 shadow-amber-500/20" 
                  : "text-on-surface-variant hover:text-amber-500 hover:bg-amber-500/5"
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
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300",
                "bg-surface-container-highest/90 backdrop-blur-md shadow-lg border border-outline-variant/20",
                "active:scale-90 touch-manipulation hover:scale-110",
                "text-error hover:bg-error/10 hover:border-error/30 hover:shadow-error/20"
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
});

TouchOptimizedCard.displayName = "TouchOptimizedCard";