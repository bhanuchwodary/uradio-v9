
import React from "react";
import { MusicPlayer } from "@/components/ui/player/MusicPlayer";
import { Track } from "@/types/track";
import { cn } from "@/lib/utils";

interface PlaylistPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  handlePlayPause: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  loading: boolean;
}

const PlaylistPlayer: React.FC<PlaylistPlayerProps> = ({
  currentTrack,
  isPlaying,
  handlePlayPause,
  handleNext,
  handlePrevious,
  volume,
  setVolume,
  loading
}) => {
  return (
    <div className={cn(
      "mb-6 transition-all duration-300 ease-in-out",
      currentTrack ? "opacity-100 transform translate-y-0" : "opacity-90"
    )}>
      <MusicPlayer
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        volume={volume}
        onVolumeChange={setVolume}
        loading={loading}
      />
    </div>
  );
};

export default PlaylistPlayer;
