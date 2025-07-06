
import React from "react";
import { Slider } from "@/components/ui/slider";

export function formatTime(time: number) {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

interface SliderWithLabelsProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number[]) => void;
  disabled: boolean;
}

const SliderWithLabels: React.FC<SliderWithLabelsProps> = ({
  currentTime,
  duration,
  onSeek,
  disabled
}) => (
  <div className="flex items-center gap-2">
    <span className="text-xs">{formatTime(currentTime)}</span>
    <Slider
      value={[currentTime || 0]}
      max={duration || 100}
      step={1}
      onValueChange={onSeek}
      className="flex-1"
      disabled={disabled}
    />
    <span className="text-xs">{formatTime(duration)}</span>
  </div>
);

export default SliderWithLabels;
