
import { useRef } from "react";

export const useTrackStateDebugCore = () => {
  const stateVersion = useRef(0);
  
  return {
    stateVersion
  };
};
