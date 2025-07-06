
import React from "react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { ANIMATIONS } from "@/constants/app";

interface EnhancedLoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "pulsing" | "dots" | "bars";
  className?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

const DotsLoader: React.FC<{ size: string }> = ({ size }) => (
  <div className="flex space-x-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          "rounded-full bg-primary animate-bounce",
          size === "xs" ? "h-1 w-1" : size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2"
        )}
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
);

const BarsLoader: React.FC<{ size: string }> = ({ size }) => (
  <div className="flex space-x-1">
    {[0, 1, 2, 3].map((i) => (
      <div
        key={i}
        className={cn(
          "bg-primary animate-pulse",
          size === "xs" ? "h-3 w-0.5" : size === "sm" ? "h-4 w-1" : "h-6 w-1"
        )}
        style={{ animationDelay: `${i * 0.1}s` }}
      />
    ))}
  </div>
);

export const EnhancedLoadingSpinner: React.FC<EnhancedLoadingSpinnerProps> = ({
  size = "md",
  variant = "default",
  className,
  text,
  fullScreen = false,
  overlay = false
}) => {
  const renderSpinner = () => {
    switch (variant) {
      case "pulsing":
        return (
          <div className={cn("rounded-full bg-primary animate-pulse", sizeClasses[size])} />
        );
      case "dots":
        return <DotsLoader size={size} />;
      case "bars":
        return <BarsLoader size={size} />;
      default:
        return <Loader className={cn("animate-spin", sizeClasses[size])} />;
    }
  };

  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      {renderSpinner()}
      {text && (
        <span className={cn(
          "text-muted-foreground animate-pulse",
          size === "xs" || size === "sm" ? "text-xs" : "text-sm"
        )}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        overlay ? "bg-background/80 backdrop-blur-sm" : "bg-background",
        ANIMATIONS.FADE_IN
      )}>
        {content}
      </div>
    );
  }

  return content;
};
