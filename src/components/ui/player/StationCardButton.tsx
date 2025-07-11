
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
        "w-14 h-14 rounded-full flex items-center justify-center smooth-animation shadow-lg elevation-2 hover:elevation-4",
        "transform group-hover:scale-115 group-active:scale-95 ios-touch-target",
        isPlaying 
          ? "bg-primary text-primary-foreground shadow-xl shadow-primary/30 ring-2 ring-primary/20" 
          : inPlaylist && actionIcon === "add"
          ? "bg-green-500/25 text-green-600 border-2 border-green-500/40 shadow-green-500/20"
          : isProcessing
          ? "bg-blue-500/25 text-blue-600 border-2 border-blue-500/40 animate-pulse shadow-blue-500/20"
          : "bg-surface-container text-on-surface group-hover:bg-primary/20 group-hover:text-primary shadow-lg",
        // Disable hover scale if already in playlist or being processed
        isDisabled && "group-hover:scale-100 opacity-60"
      )}
      onClick={onClick}
    >
      <ActionIcon className={cn(
        "smooth-animation",
        actionIcon !== "add" && !isPlaying && "ml-0.5",
        "w-6 h-6"
      )} />
    </div>
  );
};
