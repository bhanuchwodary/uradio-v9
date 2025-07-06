import { useEffect, useRef } from "react";
import { logger, usePerformanceLogger } from "@/utils/logger";
import { PERFORMANCE_CONFIG } from "@/constants/app";

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
}

export const useAppPerformance = (componentName: string, dependencies: any[] = []) => {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const lastRenderStart = useRef<number>(0);
  const { startTimer, endTimer } = usePerformanceLogger();

  useEffect(() => {
    lastRenderStart.current = performance.now();
    startTimer(`${componentName}_render`);
    renderCount.current++;

    return () => {
      const renderTime = performance.now() - lastRenderStart.current;
      endTimer(`${componentName}_render`);
      
      renderTimes.current.push(renderTime);
      
      // Keep only last 100 render times for memory efficiency
      if (renderTimes.current.length > 100) {
        renderTimes.current = renderTimes.current.slice(-100);
      }

      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        logger.warn(`Slow render detected in ${componentName}`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current
        });
      }
    };
  }, dependencies);

  const getMetrics = (): PerformanceMetrics => {
    const averageRenderTime = renderTimes.current.length > 0
      ? renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length
      : 0;

    const metrics: PerformanceMetrics = {
      renderCount: renderCount.current,
      lastRenderTime: renderTimes.current[renderTimes.current.length - 1] || 0,
      averageRenderTime
    };

    // Add memory usage if available
    if ('memory' in performance) {
      metrics.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }

    return metrics;
  };

  const logMetrics = () => {
    if (process.env.NODE_ENV === 'development') {
      const metrics = getMetrics();
      logger.info(`Performance metrics for ${componentName}`, metrics);
    }
  };

  return {
    getMetrics,
    logMetrics,
    renderCount: renderCount.current
  };
};

// Hook for monitoring component lifecycle performance
export const useComponentLifecycle = (componentName: string) => {
  const mountTime = useRef<number>(0);
  const { startTimer, endTimer } = usePerformanceLogger();

  useEffect(() => {
    mountTime.current = performance.now();
    startTimer(`${componentName}_mount`);
    
    logger.debug(`${componentName} mounted`);

    return () => {
      endTimer(`${componentName}_mount`);
      const lifetime = performance.now() - mountTime.current;
      
      logger.debug(`${componentName} unmounted`, {
        lifetime: `${lifetime.toFixed(2)}ms`
      });
    };
  }, [componentName, startTimer, endTimer]);
};

// Hook for monitoring expensive operations
export const useOperationPerformance = () => {
  const { startTimer, endTimer } = usePerformanceLogger();

  const measureOperation = async <T>(
    operationName: string,
    operation: () => Promise<T> | T
  ): Promise<T> => {
    startTimer(operationName);
    
    try {
      const result = await operation();
      endTimer(operationName);
      return result;
    } catch (error) {
      endTimer(operationName);
      logger.error(`Operation ${operationName} failed`, error);
      throw error;
    }
  };

  return { measureOperation };
};
