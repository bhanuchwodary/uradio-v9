
import React from "react";
import { StationCardSkeleton } from "./StationCardSkeleton";

interface StationGridSkeletonProps {
  count?: number;
}

export const StationGridSkeleton: React.FC<StationGridSkeletonProps> = ({ 
  count = 12 
}) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <StationCardSkeleton key={index} />
      ))}
    </div>
  );
};
