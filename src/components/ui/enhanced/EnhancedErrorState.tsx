import React, { memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Wifi, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedErrorStateProps {
  title?: string;
  message?: string;
  type?: "network" | "stream" | "generic" | "permission";
  onRetry?: () => void;
  retrying?: boolean;
  canRetry?: boolean;
  className?: string;
}

const errorConfig = {
  network: {
    icon: Wifi,
    title: "Connection Lost",
    message: "Please check your internet connection and try again.",
    color: "text-destructive"
  },
  stream: {
    icon: Radio,
    title: "Stream Unavailable",
    message: "This station is currently unavailable. Please try another station.",
    color: "text-warning"
  },
  permission: {
    icon: AlertTriangle,
    title: "Permission Required",
    message: "Please allow audio playback to continue.",
    color: "text-warning"
  },
  generic: {
    icon: AlertTriangle,
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
    color: "text-destructive"
  }
};

export const EnhancedErrorState: React.FC<EnhancedErrorStateProps> = memo(({
  title,
  message,
  type = "generic",
  onRetry,
  retrying = false,
  canRetry = true,
  className
}) => {
  const config = errorConfig[type];
  const IconComponent = config.icon;

  return (
    <Card className={cn(
      "p-6 bg-gradient-to-br from-surface-container/60 to-surface-container/80",
      "backdrop-blur-md border border-outline-variant/30 shadow-lg rounded-2xl",
      "text-center",
      className
    )}>
      <div className="flex flex-col items-center space-y-4">
        {/* Error Icon */}
        <div className={cn(
          "p-3 rounded-full bg-destructive/10 border border-destructive/20",
          type === "stream" && "bg-warning/10 border-warning/20",
          type === "network" && "bg-primary/10 border-primary/20"
        )}>
          <IconComponent className={cn("h-8 w-8", config.color)} />
        </div>

        {/* Error Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-on-surface">
            {title || config.title}
          </h3>
          <p className="text-sm text-on-surface-variant max-w-md">
            {message || config.message}
          </p>
        </div>

        {/* Retry Button */}
        {onRetry && canRetry && (
          <Button
            onClick={onRetry}
            disabled={retrying}
            className={cn(
              "mt-4 min-w-[120px]",
              retrying && "animate-pulse"
            )}
            variant="default"
          >
            {retrying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </>
            )}
          </Button>
        )}

        {/* No retry available message */}
        {!canRetry && onRetry && (
          <p className="text-xs text-on-surface-variant/70 mt-2">
            Maximum retry attempts reached. Please try again later.
          </p>
        )}
      </div>
    </Card>
  );
});

EnhancedErrorState.displayName = "EnhancedErrorState";

// Specialized error components for common scenarios
export const NetworkErrorState = memo((props: Omit<EnhancedErrorStateProps, 'type'>) => (
  <EnhancedErrorState {...props} type="network" />
));

export const StreamErrorState = memo((props: Omit<EnhancedErrorStateProps, 'type'>) => (
  <EnhancedErrorState {...props} type="stream" />
));

export const PermissionErrorState = memo((props: Omit<EnhancedErrorStateProps, 'type'>) => (
  <EnhancedErrorState {...props} type="permission" />
));

NetworkErrorState.displayName = "NetworkErrorState";
StreamErrorState.displayName = "StreamErrorState";
PermissionErrorState.displayName = "PermissionErrorState";