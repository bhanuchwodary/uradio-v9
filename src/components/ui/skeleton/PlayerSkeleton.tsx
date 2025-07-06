
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const PlayerSkeleton: React.FC = () => {
  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        {/* Track Info */}
        <div className="text-center space-y-2">
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        
        {/* Volume */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-2 flex-1 rounded-full" />
          <Skeleton className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
};
