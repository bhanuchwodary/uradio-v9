
import React from "react";
import TrackInfo from "@/components/music-player/TrackInfo";

interface PlayerTrackInfoProps {
  title: string;
  url?: string;
  loading: boolean;
}

const PlayerTrackInfo: React.FC<PlayerTrackInfoProps> = ({ title, url, loading }) => (
  <TrackInfo title={title} url={url} loading={loading} />
);

export default PlayerTrackInfo;
