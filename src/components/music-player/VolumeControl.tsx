
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";

interface VolumeControlProps {
  volume: number;
  setVolume: (v: number) => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ volume, setVolume }) => (
  <div className="flex items-center gap-2">
    <Volume2 className="w-4 h-4" />
    <Slider
      value={[volume * 100]}
      max={100}
      step={1}
      onValueChange={(values) => setVolume(values[0] / 100)}
      className="flex-1"
    />
  </div>
);

export default VolumeControl;
