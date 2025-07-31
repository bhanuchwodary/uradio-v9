import { useEffect, useRef, useCallback, useMemo } from 'react';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  renderCount: number;
  averageRenderTime: number;
  memoryUsage?: number;
  isVisible: boolean;
}

// Enhanced performance hook with better memory management and visibility optimization
export const useOptimizedPerformance = (componentName: string, dependencies: any[] = []) => {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const lastRenderStart = useRef<number>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const isVisible = useRef(true);

  // Optimized intersection observer for visibility-based performance
  const visibilityObserver = useMemo(() => {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      return new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisible.current = entry.isIntersecting;
            if (!entry.isIntersecting) {
              logger.debug(`${componentName} is out of view - performance optimizations active`);
            }
          });
        },
        { threshold: 0.1, rootMargin: '100px' }
      );
    }
    return null;
  }, [componentName]);

  // Track render performance with visibility awareness
  useEffect(() => {
    if (isVisible.current) {
      lastRenderStart.current = performance.now();
      renderCount.current++;
    }

    return () => {
      if (isVisible.current) {
        const renderTime = performance.now() - lastRenderStart.current;
        renderTimes.current.push(renderTime);
        
        // Keep only last 50 render times for memory efficiency
        if (renderTimes.current.length > 50) {
          renderTimes.current = renderTimes.current.slice(-50);
        }

        // Log slow renders only in development
        if (process.env.NODE_ENV === 'development' && renderTime > 16) {
          logger.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
        }
      }
    };
  }, dependencies);

  // Set up visibility observer
  const setRef = useCallback((element: HTMLElement | null) => {
    if (elementRef.current && observerRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }
    
    elementRef.current = element;
    
    if (element && visibilityObserver) {
      observerRef.current = visibilityObserver;
      visibilityObserver.observe(element);
    }
  }, [visibilityObserver]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current);
      }
      if (visibilityObserver) {
        visibilityObserver.disconnect();
      }
    };
  }, [visibilityObserver]);

  const getMetrics = useCallback((): PerformanceMetrics => {
    const averageRenderTime = renderTimes.current.length > 0
      ? renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length
      : 0;

    const metrics: PerformanceMetrics = {
      renderCount: renderCount.current,
      averageRenderTime,
      isVisible: isVisible.current
    };

    // Add memory usage if available
    if ('memory' in performance) {
      metrics.memoryUsage = (performance as any).memory?.usedJSHeapSize;
    }

    return metrics;
  }, []);

  return {
    setRef,
    getMetrics,
    isVisible: isVisible.current,
    renderCount: renderCount.current
  };
};

// Optimized debounce hook with cleanup
export const useOptimizedDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

// Optimized throttle hook
export const useOptimizedThrottle = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) => {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callbackRef.current(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now();
        callbackRef.current(...args);
      }, delay - (now - lastCall.current));
    }
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};
