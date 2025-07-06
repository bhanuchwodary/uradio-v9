import { useEffect, useRef, useCallback } from 'react';
import { logger } from '@/utils/logger';

interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export const useMemoryOptimization = (componentName: string) => {
  const cleanupFunctions = useRef<Array<() => void>>([]);
  const timers = useRef<Array<NodeJS.Timeout>>([]);
  const observers = useRef<Array<IntersectionObserver | ResizeObserver | MutationObserver>>([]);

  // Register cleanup function
  const registerCleanup = useCallback((cleanupFn: () => void) => {
    cleanupFunctions.current.push(cleanupFn);
  }, []);

  // Register timer for automatic cleanup
  const registerTimer = useCallback((timer: NodeJS.Timeout) => {
    timers.current.push(timer);
  }, []);

  // Register observer for automatic cleanup
  const registerObserver = useCallback((observer: IntersectionObserver | ResizeObserver | MutationObserver) => {
    observers.current.push(observer);
  }, []);

  // Get memory metrics if available
  const getMemoryMetrics = useCallback((): MemoryMetrics | null => {
    if ('memory' in performance && (performance as any).memory) {
      return {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
      };
    }
    return null;
  }, []);

  // Log memory usage
  const logMemoryUsage = useCallback(() => {
    const metrics = getMemoryMetrics();
    if (metrics && process.env.NODE_ENV === 'development') {
      const usedMB = Math.round(metrics.usedJSHeapSize / 1048576 * 100) / 100;
      const totalMB = Math.round(metrics.totalJSHeapSize / 1048576 * 100) / 100;
      const percentage = Math.round((metrics.usedJSHeapSize / metrics.totalJSHeapSize) * 100);
      
      logger.debug(`Memory usage for ${componentName}`, {
        used: `${usedMB}MB`,
        total: `${totalMB}MB`,
        usage: `${percentage}%`
      });
    }
  }, [componentName, getMemoryMetrics]);

  // Cleanup all registered resources
  const cleanup = useCallback(() => {
    // Run cleanup functions
    cleanupFunctions.current.forEach(cleanupFn => {
      try {
        cleanupFn();
      } catch (error) {
        logger.error(`Cleanup error in ${componentName}:`, error);
      }
    });

    // Clear timers
    timers.current.forEach(timer => {
      clearTimeout(timer);
    });

    // Disconnect observers
    observers.current.forEach(observer => {
      observer.disconnect();
    });

    // Clear arrays
    cleanupFunctions.current = [];
    timers.current = [];
    observers.current = [];
  }, [componentName]);

  // Auto cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Optional memory monitoring
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (process.env.NODE_ENV === 'development') {
      // Log memory usage every 30 seconds in development
      intervalId = setInterval(logMemoryUsage, 30000);
      registerTimer(intervalId);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [logMemoryUsage, registerTimer]);

  return {
    registerCleanup,
    registerTimer,
    registerObserver,
    getMemoryMetrics,
    logMemoryUsage,
    cleanup
  };
};

// Hook for optimizing heavy operations
export const useHeavyOperationOptimization = () => {
  const operationCache = useRef<Map<string, any>>(new Map());
  const pendingOperations = useRef<Set<string>>(new Set());

  const optimizedOperation = useCallback(async <T>(
    operationKey: string,
    operation: () => Promise<T>,
    cacheTimeout = 300000 // 5 minutes default
  ): Promise<T> => {
    // Return cached result if available
    if (operationCache.current.has(operationKey)) {
      return operationCache.current.get(operationKey);
    }

    // Return existing promise if operation is already pending
    if (pendingOperations.current.has(operationKey)) {
      return new Promise((resolve) => {
        const checkForResult = () => {
          if (operationCache.current.has(operationKey)) {
            resolve(operationCache.current.get(operationKey));
          } else {
            setTimeout(checkForResult, 100);
          }
        };
        checkForResult();
      });
    }

    // Mark operation as pending
    pendingOperations.current.add(operationKey);

    try {
      const result = await operation();
      
      // Cache the result
      operationCache.current.set(operationKey, result);
      
      // Set up cache expiration
      setTimeout(() => {
        operationCache.current.delete(operationKey);
      }, cacheTimeout);

      return result;
    } finally {
      // Remove from pending operations
      pendingOperations.current.delete(operationKey);
    }
  }, []);

  const clearCache = useCallback((operationKey?: string) => {
    if (operationKey) {
      operationCache.current.delete(operationKey);
    } else {
      operationCache.current.clear();
    }
  }, []);

  return {
    optimizedOperation,
    clearCache
  };
};