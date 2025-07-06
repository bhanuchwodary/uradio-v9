
import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Star, Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StationCardActionsProps } from "./types";

export const StationCardActions: React.FC<StationCardActionsProps> = ({
  station,
  context,
  onToggleFavorite,
  onEdit,
  onDelete
}) => {
  // Memoize event handlers to prevent unnecessary re-renders
  const handleButtonClick = useCallback((e: React.MouseEvent, callback?: () => void) => {
    e.stopPropagation();
    if (callback) callback();
  }, []);

  const handleEditClick = useCallback((e: React.MouseEvent) => {
    handleButtonClick(e, onEdit);
  }, [handleButtonClick, onEdit]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    handleButtonClick(e, onDelete);
  }, [handleButtonClick, onDelete]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    handleButtonClick(e, onToggleFavorite);
  }, [handleButtonClick, onToggleFavorite]);

  // Determine if edit button should be shown
  const shouldShowEditButton = () => {
    // In playlist context, don't show edit for user-added stations (non-featured)
    if (context === "playlist" && !station.isFeatured) {
      return false;
    }
    // In library context, show edit for non-featured stations
    return !station.isFeatured && onEdit;
  };

  return (
    <div className="flex justify-center space-x-0.5 mt-auto pt-0.5 opacity-75 group-hover:opacity-100 transition-opacity duration-200">
      {onToggleFavorite && (
        <Button 
          size="icon" 
          variant="ghost" 
          className={cn(
            "h-5 w-5 transition-all duration-200 transform hover:scale-110 active:scale-90", 
            station.isFavorite 
              ? "text-yellow-500 hover:text-yellow-600" 
              : "text-muted-foreground hover:text-yellow-500"
          )}
          onClick={handleFavoriteClick}
          aria-label={station.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={cn(
            "h-2.5 w-2.5 transition-all duration-200",
            station.isFavorite && "fill-yellow-500"
          )} />
        </Button>
      )}
      
      {shouldShowEditButton() && (
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-5 w-5 text-blue-500 hover:text-blue-600 transition-all duration-200 transform hover:scale-110 active:scale-90"
          onClick={handleEditClick}
          aria-label="Edit station"
        >
          <Edit className="h-2.5 w-2.5" />
        </Button>
      )}
      
      {onDelete && (
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-5 w-5 text-destructive hover:text-destructive/80 transition-all duration-200 transform hover:scale-110 active:scale-90"
          onClick={handleDeleteClick}
          aria-label={context === "playlist" ? "Remove from playlist" : "Delete station"}
        >
          <Trash2 className="h-2.5 w-2.5" />
        </Button>
      )}
    </div>
  );
};
