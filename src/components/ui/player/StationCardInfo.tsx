
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
        "font-medium text-xs line-clamp-2 w-full text-center leading-tight px-0.5",
        "min-h-[1.5rem] flex items-center justify-center transition-colors duration-200",
        isSelected ? "text-primary font-semibold" 
        : inPlaylist && actionIcon === "add" ? "text-green-700 font-medium"
        : isProcessing ? "text-blue-700 font-medium"
        : "text-foreground"
      )}>
        {station.name}
      </h3>
      
      {/* Language Badge with enhanced styling and playlist indicator */}
      <div className="flex items-center justify-center">
        <span className={cn(
          "bg-gradient-to-r px-1.5 py-0.5 rounded-full text-[9px] font-medium border shadow-sm",
          "transition-all duration-200 transform group-hover:scale-105",
          isSelected 
            ? "from-primary/20 to-primary/10 text-primary border-primary/30" 
            : inPlaylist && actionIcon === "add"
            ? "from-green-500/20 to-green-500/10 text-green-600 border-green-500/30"
            : isProcessing
            ? "from-blue-500/20 to-blue-500/10 text-blue-600 border-blue-500/30"
            : "from-muted/60 to-muted/40 text-muted-foreground border-muted/50"
        )}>
          {stationLanguage}
          {inPlaylist && actionIcon === "add" && " ✓"}
          {isProcessing && " ..."}
        </span>
      </div>
    </>
  );
};
