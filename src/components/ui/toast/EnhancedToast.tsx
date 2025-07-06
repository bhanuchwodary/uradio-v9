
import React from "react";
import { toast as baseToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { UI_CONFIG, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants/app";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface EnhancedToastOptions {
  type?: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  duration?: number;
  persistent?: boolean;
}

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
    default:
      return null;
  }
};

const getToastVariant = (type: ToastType) => {
  switch (type) {
    case 'error':
      return 'destructive' as const;
    default:
      return 'default' as const;
  }
};

export const enhancedToast = {
  show: (
    title: string,
    description?: string,
    options: EnhancedToastOptions = {}
  ) => {
    const {
      type = 'info',
      action,
      dismissible = true,
      duration = UI_CONFIG.TOAST_DURATION,
      persistent = false
    } = options;

    return baseToast({
      title,
      description: description ? (
        <div className="flex items-center gap-2">
          {getToastIcon(type)}
          <span>{description}</span>
        </div>
      ) : undefined,
      variant: getToastVariant(type),
      duration: persistent ? Infinity : duration,
      action: action ? (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={action.onClick}
            className="h-8"
          >
            {action.label}
          </Button>
          {dismissible && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => {/* Toast will auto-dismiss */}}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : undefined
    });
  },

  success: (
    title: string,
    description?: string,
    options?: Omit<EnhancedToastOptions, 'type'>
  ) => {
    return enhancedToast.show(title, description, { ...options, type: 'success' });
  },

  error: (
    title: string,
    description?: string,
    options?: Omit<EnhancedToastOptions, 'type'>
  ) => {
    return enhancedToast.show(title, description, { ...options, type: 'error' });
  },

  warning: (
    title: string,
    description?: string,
    options?: Omit<EnhancedToastOptions, 'type'>
  ) => {
    return enhancedToast.show(title, description, { ...options, type: 'warning' });
  },

  info: (
    title: string,
    description?: string,
    options?: Omit<EnhancedToastOptions, 'type'>
  ) => {
    return enhancedToast.show(title, description, { ...options, type: 'info' });
  },

  // Convenience methods for common scenarios
  stationAdded: (stationName: string, options?: EnhancedToastOptions) => {
    return enhancedToast.success(
      SUCCESS_MESSAGES.STATION_ADDED,
      `${stationName} is now available in your library`,
      options
    );
  },

  stationRemoved: (stationName: string, options?: EnhancedToastOptions) => {
    return enhancedToast.success(
      SUCCESS_MESSAGES.STATION_REMOVED,
      `${stationName} has been removed from your library`,
      options
    );
  },

  playbackError: (stationName?: string, options?: EnhancedToastOptions) => {
    return enhancedToast.error(
      ERROR_MESSAGES.AUDIO_LOAD_FAILED,
      stationName ? `Unable to play ${stationName}. Please try again.` : undefined,
      {
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        },
        ...options
      }
    );
  },

  networkError: (options?: EnhancedToastOptions) => {
    return enhancedToast.error(
      ERROR_MESSAGES.NETWORK,
      'Please check your internet connection and try again.',
      {
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        },
        ...options
      }
    );
  }
};
