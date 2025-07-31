import React, { memo } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface EnhancedLoadingStateProps {
  type?: "grid" | "list" | "player" | "card";
  count?: number;
  className?: string;
  message?: string;
}

const LoadingCard = memo(() => (
  <Card className="relative overflow-hidden h-full">
    <div className="px-2 py-2.5 flex flex-col items-center space-y-1.5 h-full">
      {/* Play Button Skeleton */}
      <Skeleton className="w-10 h-10 rounded-full animate-pulse" />
      
      {/* Station Name Skeleton */}
      <div className="w-full px-1 space-y-1">
        <Skeleton className="h-3 w-full animate-pulse" />
        <Skeleton className="h-3 w-3/4 mx-auto animate-pulse" />
      </div>
      
      {/* Language Badge Skeleton */}
      <Skeleton className="h-5 w-16 rounded-full animate-pulse" />
      
      {/* Action Buttons Skeleton */}
      <div className="flex justify-center space-x-0.5 mt-auto pt-1">
        <Skeleton className="h-6 w-6 rounded-full animate-pulse" />
        <Skeleton className="h-6 w-6 rounded-full animate-pulse" />
        <Skeleton className="h-6 w-6 rounded-full animate-pulse" />
      </div>
    </div>
  </Card>
));

LoadingCard.displayName = "LoadingCard";

const LoadingListItem = memo(() => (
  <div className="flex items-center space-x-4 p-4 bg-surface-container rounded-lg">
    <Skeleton className="w-12 h-12 rounded-full animate-pulse" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4 animate-pulse" />
      <Skeleton className="h-3 w-1/2 animate-pulse" />
    </div>
    <Skeleton className="w-8 h-8 rounded-full animate-pulse" />
  </div>
));

LoadingListItem.displayName = "LoadingListItem";

const LoadingPlayer = memo(() => (
  <Card className="p-4 bg-gradient-to-br from-surface-container/60 to-surface-container/80 backdrop-blur-md border border-outline-variant/30 shadow-lg rounded-2xl">
    <div className="flex flex-col space-y-4">
      {/* Station info skeleton */}
      <div className="text-center px-2 space-y-2">
        <Skeleton className="h-6 w-48 mx-auto animate-pulse" />
        <Skeleton className="h-3 w-32 mx-auto animate-pulse" />
        <Skeleton className="h-5 w-20 mx-auto rounded-full animate-pulse" />
      </div>

      {/* Controls skeleton */}
      <div className="flex items-center justify-center space-x-4 py-2">
        <Skeleton className="h-12 w-12 rounded-full animate-pulse" />
        <Skeleton className="h-16 w-16 rounded-full animate-pulse" />
        <Skeleton className="h-12 w-12 rounded-full animate-pulse" />
      </div>

      {/* Volume control skeleton */}
      <div className="flex items-center space-x-3 px-2">
        <Skeleton className="h-5 w-5 animate-pulse" />
        <Skeleton className="h-2 flex-1 rounded-full animate-pulse" />
      </div>
    </div>
  </Card>
));

LoadingPlayer.displayName = "LoadingPlayer";

export const EnhancedLoadingState: React.FC<EnhancedLoadingStateProps> = memo(({
  type = "grid",
  count = 12,
  className,
  message
}) => {
  const renderLoadingContent = () => {
    switch (type) {
      case "grid":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: count }).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        );
      
      case "list":
        return (
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, index) => (
              <LoadingListItem key={index} />
            ))}
          </div>
        );
      
      case "player":
        return <LoadingPlayer />;
      
      case "card":
        return <LoadingCard />;
      
      default:
        return null;
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {message && (
        <div className="text-center mb-4">
          <p className="text-sm text-on-surface-variant animate-pulse">{message}</p>
        </div>
      )}
      {renderLoadingContent()}
    </div>
  );
});

EnhancedLoadingState.displayName = "EnhancedLoadingState";