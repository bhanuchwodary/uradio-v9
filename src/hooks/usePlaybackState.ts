
import { useState } from "react";

export const usePlaybackState = () => {
  const [trackDuration, setTrackDuration] = useState(0);
  const [trackPosition, setTrackPosition] = useState(0);

  const updateTrackProgress = (duration: number, position: number) => {
    setTrackDuration(duration);
    setTrackPosition(position);
  };

  const seekTo = (position: number) => {
    setTrackPosition(position);
  };

  return {
    trackDuration,
    trackPosition,
    updateTrackProgress,
    seekTo,
  };
};
