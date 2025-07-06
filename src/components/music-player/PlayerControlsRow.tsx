
import React from "react";
import PlayerControls from "@/components/music-player/PlayerControls";

interface PlayerControlsRowProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  disabled: boolean;
}

const PlayerControlsRow: React.FC<PlayerControlsRowProps> = (props) => (
  <PlayerControls {...props} />
);

export default PlayerControlsRow;
