
import React from "react";
import SliderWithLabels from "@/components/music-player/SliderWithLabels";

interface PlayerSliderProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number[]) => void;
  disabled: boolean;
}

const PlayerSlider: React.FC<PlayerSliderProps> = ({ currentTime, duration, onSeek, disabled }) => (
  <SliderWithLabels
    currentTime={currentTime}
    duration={duration}
    onSeek={onSeek}
    disabled={disabled}
  />
);

export default PlayerSlider;
