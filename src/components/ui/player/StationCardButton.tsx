
import React from "react";
import { Play, Pause, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { StationCardButtonProps } from "./types";

export const StationCardButton: React.FC<StationCardButtonProps> = ({
  station,
  isPlaying,
  actionIcon,
  inPlaylist,
  isAddingToPlaylist,
  onClick,
  isDisabled,
  isProcessing
}) => {
  // Determine the main action icon based on context and playlist status
  const ActionIcon = actionIcon === "add" 
    ? (inPlaylist ? Check : Plus) 
    : (isPlaying ? Pause : Play);

  return (
    <div 
      className={cn(
        "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl",
        "transform group-hover:scale-110 group-active:scale-95 relative overflow-hidden backdrop-blur-md",
        "before:absolute before:inset-0 before:rounded-full before:transition-all before:duration-300",
        isPlaying 
          ? "bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground shadow-primary/40 ring-2 ring-primary/30" 
          : inPlaylist && actionIcon === "add"
          ? "bg-gradient-to-br from-emerald-500/20 via-emerald-500/15 to-emerald-500/10 text-emerald-600 border-2 border-emerald-500/40 shadow-emerald-500/20"
          : isProcessing
          ? "bg-gradient-to-br from-blue-500/20 via-blue-500/15 to-blue-500/10 text-blue-600 border-2 border-blue-500/40 shadow-blue-500/20 animate-pulse"
          : "bg-gradient-to-br from-surface-container-highest via-surface-container-high to-surface-container text-on-surface group-hover:from-secondary-container/80 group-hover:via-secondary-container/60 group-hover:to-secondary-container/40 group-hover:text-on-secondary-container",
        // Disable hover scale if already in playlist or being processed
        isDisabled && "group-hover:scale-100 opacity-60"
      )}
      onClick={onClick}
    >
      <ActionIcon className={cn(
        "transition-all duration-300 drop-shadow-sm",
        actionIcon !== "add" && !isPlaying && "ml-0.5",
        "w-6 h-6"
      )} />
    </div>
  );
};
