
import React from "react";
import { cn } from "@/lib/utils";
import { StationCardInfoProps } from "./types";

export const StationCardInfo: React.FC<StationCardInfoProps> = ({
  station,
  isSelected,
  inPlaylist,
  isProcessing,
  actionIcon
}) => {
  // Ensure language is preserved from station data with proper fallback
  const stationLanguage = station?.language && station.language !== "" ? station.language : "Unknown";

  return (
    <>
      {/* Station Name with better typography */}
      <h3 className={cn(
        "font-semibold text-sm line-clamp-2 w-full text-center leading-tight px-1",
        "min-h-[2rem] flex items-center justify-center transition-all duration-300",
        "tracking-wide drop-shadow-sm",
        isSelected ? "text-primary font-bold scale-105" 
        : inPlaylist && actionIcon === "add" ? "text-emerald-700 font-semibold"
        : isProcessing ? "text-blue-700 font-semibold"
        : "text-foreground group-hover:text-on-secondary-container"
      )}>
        {station.name}
      </h3>
      
      {/* Language Badge with enhanced styling and playlist indicator */}
      <div className="flex items-center justify-center mt-1">
        <span className={cn(
          "px-2.5 py-1 rounded-full text-[10px] font-bold border-2 shadow-lg backdrop-blur-sm",
          "transition-all duration-300 transform group-hover:scale-105 tracking-wider uppercase",
          "bg-gradient-to-r border-solid relative overflow-hidden",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:opacity-0 before:transition-opacity before:duration-300",
          isSelected 
            ? "from-primary/30 via-primary/20 to-primary/10 text-primary border-primary/50 shadow-primary/20" 
            : inPlaylist && actionIcon === "add"
            ? "from-emerald-500/30 via-emerald-500/20 to-emerald-500/10 text-emerald-700 border-emerald-500/50 shadow-emerald-500/20"
            : isProcessing
            ? "from-blue-500/30 via-blue-500/20 to-blue-500/10 text-blue-700 border-blue-500/50 shadow-blue-500/20"
            : "from-surface-container-highest/80 via-surface-container-high/60 to-surface-container/40 text-on-surface-variant border-outline-variant/30 group-hover:from-secondary-container/60 group-hover:to-secondary-container/30 group-hover:text-on-secondary-container group-hover:border-secondary/40"
        )}>
          {stationLanguage}
          {inPlaylist && actionIcon === "add" && <span className="ml-1">✓</span>}
          {isProcessing && <span className="ml-1 animate-pulse">⏳</span>}
        </span>
      </div>
    </>
  );
};
