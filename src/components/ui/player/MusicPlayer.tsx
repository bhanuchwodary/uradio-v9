
import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Track } from "@/types/track";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { saveVolumePreference } from "@/utils/volumeStorage";

interface MusicPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  loading?: boolean;
  compact?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  volume,
  onVolumeChange,
  loading = false,
  compact = false
}) => {
  // Save volume preference whenever it changes
  useEffect(() => {
    saveVolumePreference(volume);
  }, [volume]);

  const getHostnameFromUrl = (url: string): string => {
    if (!url) return "No URL";
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      return "Invalid URL";
    }
  };

  if (compact) {
    return (
      <div className="flex items-center">
        {/* Compact Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!currentTrack}
            className="h-7 w-7 rounded-lg bg-surface-container/60 hover:bg-surface-container/80 border border-outline-variant/20 transition-all active:scale-95"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={onPlayPause}
            disabled={!currentTrack}
            className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 shadow-sm transition-all active:scale-95"
          >
            {isPlaying ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 ml-0.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!currentTrack}
            className="h-7 w-7 rounded-lg bg-surface-container/60 hover:bg-surface-container/80 border border-outline-variant/20 transition-all active:scale-95"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Volume control - Compact, hidden on small screens */}
        <div className="hidden md:flex items-center ml-3 w-16">
          <Volume2 className="h-3.5 w-3.5 text-on-surface-variant flex-shrink-0 mr-2" />
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={(values) => onVolumeChange(values[0] / 100)}
            className="flex-1"
          />
        </div>
      </div>
    );
  }

  // Original full player layout for non-compact mode
  return (
    <Card className="p-4 bg-gradient-to-br from-surface-container/60 to-surface-container/80 backdrop-blur-md border border-outline-variant/30 shadow-lg rounded-2xl">
      <div className="flex flex-col space-y-4">
        {/* Station info */}
        <div className="text-center px-2">
          <h2 className="text-xl font-bold truncate leading-tight text-on-surface">
            {currentTrack?.name || "Select a station"}
          </h2>
          <p className="text-xs text-on-surface-variant truncate mt-1">
            {currentTrack?.url ? getHostnameFromUrl(currentTrack.url) : "No station selected"}
          </p>
          {currentTrack?.language && (
            <div className="flex items-center justify-center text-xs mt-2">
              <span className="bg-primary/15 text-primary px-2 py-1 rounded-full">{currentTrack.language}</span>
            </div>
          )}
          {loading && (
            <p className="text-xs text-primary animate-pulse mt-2">Loading stream...</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={!currentTrack}
            className="h-12 w-12 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 ios-touch-target active:scale-95 transition-transform"
          >
            <SkipBack className="h-6 w-6" />
          </Button>
          
          <Button
            variant="default"
            size="icon"
            onClick={onPlayPause}
            disabled={!currentTrack}
            className={cn(
              "h-16 w-16 rounded-full ios-touch-target active:scale-95 transition-transform shadow-lg",
              isPlaying ? "bg-primary/90" : "bg-primary"
            )}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={!currentTrack}
            className="h-12 w-12 rounded-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 ios-touch-target active:scale-95 transition-transform"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
        </div>

        {/* Volume control */}
        <div className="flex items-center space-x-3 px-2">
          <Volume2 className="h-5 w-5 text-on-surface-variant flex-shrink-0" />
          <div className="flex-1 py-2">
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={(values) => onVolumeChange(values[0] / 100)}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
