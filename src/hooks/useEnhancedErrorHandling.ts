import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { ERROR_MESSAGES } from '@/constants/app';

interface ErrorState {
  isError: boolean;
  errorMessage: string;
  errorCode?: string;
  retryCount: number;
  lastError?: Error;
}

interface ErrorHandlerOptions {
  maxRetries?: number;
  retryDelay?: number;
  showToast?: boolean;
  logError?: boolean;
  component?: string;
}

const DEFAULT_OPTIONS: Required<ErrorHandlerOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  showToast: true,
  logError: true,
  component: 'Unknown'
};

export const useEnhancedErrorHandling = (options: ErrorHandlerOptions = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const { toast } = useToast();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  
  const [errorState, setErrorState] = useState<ErrorState>({
    isError: false,
    errorMessage: '',
    retryCount: 0
  });

  // Clear error state
  const clearError = useCallback(() => {
    setErrorState({
      isError: false,
      errorMessage: '',
      retryCount: 0
    });
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  // Handle error with automatic retry logic
  const handleError = useCallback(async (
    error: Error | string,
    retryFunction?: () => Promise<void> | void,
    errorCode?: string
  ) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    // Log error if enabled
    if (config.logError) {
      logger.error(`Error in ${config.component}:`, {
        message: errorMessage,
        code: errorCode,
        stack: errorObj.stack,
        retryCount: errorState.retryCount
      });
    }

    // Update error state
    setErrorState(prev => ({
      isError: true,
      errorMessage,
      errorCode,
      retryCount: prev.retryCount + 1,
      lastError: errorObj
    }));

    // Show toast notification if enabled
    if (config.showToast) {
      toast({
        title: "Error",
        description: getReadableErrorMessage(errorMessage, errorCode),
        variant: "destructive",
      });
    }

    // Attempt retry if function provided and within retry limit
    if (retryFunction && errorState.retryCount < config.maxRetries) {
      const delay = config.retryDelay * Math.pow(2, errorState.retryCount); // Exponential backoff
      
      logger.info(`Retrying operation in ${delay}ms (attempt ${errorState.retryCount + 1}/${config.maxRetries})`);
      
      retryTimeoutRef.current = setTimeout(async () => {
        try {
          await retryFunction();
          clearError(); // Clear error state on successful retry
        } catch (retryError) {
          handleError(retryError as Error, retryFunction, errorCode);
        }
      }, delay);
    }
  }, [config, errorState.retryCount, toast, clearError]);

  // Manual retry function
  const retry = useCallback(async (retryFunction: () => Promise<void> | void) => {
    if (errorState.retryCount >= config.maxRetries) {
      if (config.showToast) {
        toast({
          title: "Max Retries Exceeded",
          description: "Please try again later or contact support.",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      await retryFunction();
      clearError();
    } catch (error) {
      handleError(error as Error, retryFunction);
    }
  }, [errorState.retryCount, config.maxRetries, config.showToast, toast, clearError, handleError]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...errorState,
    handleError,
    clearError,
    retry,
    canRetry: errorState.retryCount < config.maxRetries
  };
};

// Helper function to get user-friendly error messages
const getReadableErrorMessage = (errorMessage: string, errorCode?: string): string => {
  // Network-related errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK;
  }
  
  // Audio-related errors
  if (errorMessage.includes('audio') || errorMessage.includes('media')) {
    return ERROR_MESSAGES.AUDIO_LOAD_FAILED;
  }
  
  // Timeout errors
  if (errorMessage.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT;
  }
  
  // Permission errors
  if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
    return ERROR_MESSAGES.PERMISSION_DENIED;
  }
  
  // URL-related errors
  if (errorMessage.includes('url') || errorMessage.includes('invalid')) {
    return ERROR_MESSAGES.INVALID_URL;
  }
  
  // Storage errors
  if (errorMessage.includes('storage') || errorMessage.includes('localStorage')) {
    return ERROR_MESSAGES.STORAGE_FAILED;
  }
  
  // Use specific error code message if available
  if (errorCode && errorCode in ERROR_MESSAGES) {
    return ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES];
  }
  
  // Return original message if it's user-friendly, otherwise use generic
  return errorMessage.length < 100 ? errorMessage : ERROR_MESSAGES.GENERIC;
};

// Hook for stream-specific error handling
export const useStreamErrorHandling = () => {
  const errorHandler = useEnhancedErrorHandling({
    maxRetries: 5,
    retryDelay: 2000,
    component: 'StreamHandler'
  });

  const handleStreamError = useCallback((error: Error, streamUrl: string, retryCallback?: () => void) => {
    logger.warn(`Stream error for URL: ${streamUrl}`, error);
    
    // Specific handling for common stream errors
    if (error.message.includes('NETWORK_ERROR') || error.message.includes('net::ERR_')) {
      errorHandler.handleError(
        'Network connection lost. Attempting to reconnect...',
        retryCallback,
        'NETWORK_ERROR'
      );
    } else if (error.message.includes('MEDIA_ERROR')) {
      errorHandler.handleError(
        'Media playback error. Trying to recover...',
        retryCallback,
        'MEDIA_ERROR'
      );
    } else if (error.message.includes('404') || error.message.includes('Not Found')) {
      errorHandler.handleError(
        'Stream is currently unavailable. Please try another station.',
        undefined,
        'STREAM_NOT_FOUND'
      );
    } else {
      errorHandler.handleError(error, retryCallback, 'STREAM_ERROR');
    }
  }, [errorHandler]);

  return {
    ...errorHandler,
    handleStreamError
  };
};