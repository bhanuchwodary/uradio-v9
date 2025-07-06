
import React from "react";
import VolumeControl from "@/components/music-player/VolumeControl";

interface PlayerVolumeProps {
  volume: number;
  setVolume: (v: number) => void;
}

const PlayerVolume: React.FC<PlayerVolumeProps> = ({ volume, setVolume }) => (
  <VolumeControl volume={volume} setVolume={setVolume} />
);

export default PlayerVolume;
