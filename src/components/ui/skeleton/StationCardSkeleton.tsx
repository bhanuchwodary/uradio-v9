
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export const StationCardSkeleton: React.FC = () => {
  return (
    <Card className="relative overflow-hidden h-full">
      <div className="px-2 py-2.5 flex flex-col items-center space-y-1.5 h-full">
        {/* Play Button Skeleton */}
        <Skeleton className="w-10 h-10 rounded-full" />
        
        {/* Station Name Skeleton */}
        <div className="w-full px-1 space-y-1">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4 mx-auto" />
        </div>
        
        {/* Language Badge Skeleton */}
        <Skeleton className="h-5 w-16 rounded-full" />
        
        {/* Action Buttons Skeleton */}
        <div className="flex justify-center space-x-0.5 mt-auto pt-1">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>
    </Card>
  );
};
