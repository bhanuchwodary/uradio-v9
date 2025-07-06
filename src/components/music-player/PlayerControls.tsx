
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipForward, SkipBack } from "lucide-react";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  disabled: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying, onPlayPause, onNext, onPrev, disabled
}) => (
  <div className="flex justify-center gap-4">
    <Button
      variant="ghost"
      size="icon"
      onClick={onPrev}
      disabled={disabled}
      className="material-shadow-1 bg-secondary/80 hover:bg-secondary/95 hover:material-shadow-2 material-transition dark:bg-accent/80 dark:hover:bg-accent"
    >
      <SkipBack className="w-5 h-5" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      className="rounded-full bg-primary text-primary-foreground material-shadow-2 hover:material-shadow-3 material-transition h-12 w-12 ink-ripple"
      onClick={onPlayPause}
      disabled={disabled}
    >
      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={onNext}
      disabled={disabled}
      className="material-shadow-1 bg-secondary/80 hover:bg-secondary/95 hover:material-shadow-2 material-transition dark:bg-accent/80 dark:hover:bg-accent"
    >
      <SkipForward className="w-5 h-5" />
    </Button>
  </div>
);

export default PlayerControls;
