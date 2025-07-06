
import { Track } from "@/types/track";

export interface BaseStationCardProps {
  station: Track;
  isPlaying: boolean;
  isSelected: boolean;
  actionIcon?: "play" | "add";
  context?: "playlist" | "library";
  inPlaylist?: boolean;
  isAddingToPlaylist?: boolean;
}

export interface StationCardProps extends BaseStationCardProps {
  onPlay: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
}

export interface StationCardButtonProps extends BaseStationCardProps {
  onClick: (e: React.MouseEvent) => void;
  isDisabled: boolean;
  isProcessing: boolean;
}

export interface StationCardInfoProps {
  station: Track;
  isSelected: boolean;
  inPlaylist: boolean;
  isProcessing: boolean;
  actionIcon: "play" | "add";
}

export interface StationCardActionsProps {
  station: Track;
  context: "playlist" | "library";
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}
