
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
        "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm",
        "transform group-hover:scale-110 group-active:scale-95",
        isPlaying 
          ? "bg-primary text-primary-foreground shadow-md" 
          : inPlaylist && actionIcon === "add"
          ? "bg-green-500/20 text-green-600 border border-green-500/30"
          : isProcessing
          ? "bg-blue-500/20 text-blue-600 border border-blue-500/30 animate-pulse"
          : "bg-secondary/80 text-secondary-foreground group-hover:bg-primary/30",
        // Disable hover scale if already in playlist or being processed
        isDisabled && "group-hover:scale-100"
      )}
      onClick={onClick}
    >
      <ActionIcon className={cn(
        "transition-transform duration-200",
        actionIcon !== "add" && !isPlaying && "ml-0.5",
        "w-4 h-4"
      )} />
    </div>
  );
};
