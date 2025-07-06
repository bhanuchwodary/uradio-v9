import { logger } from "./logger";

/**
 * Utility functions for replacing console logs throughout the application
 * This helps maintain consistent logging practices and provides better debugging
 */

export const logDebug = (message: string, data?: any) => {
  logger.debug(message, data);
};

export const logInfo = (message: string, data?: any) => {
  logger.info(message, data);
};

export const logWarn = (message: string, data?: any) => {
  logger.warn(message, data);
};

export const logError = (message: string, data?: any) => {
  logger.error(message, data);
};

// Performance logging helpers
export const startPerformanceTimer = (name: string, metadata?: any) => {
  logger.startPerformance(name, metadata);
};

export const endPerformanceTimer = (name: string) => {
  logger.endPerformance(name);
};

// Common logging patterns
export const logUserAction = (action: string, data?: any) => {
  logger.info(`User action: ${action}`, data);
};

export const logStateChange = (component: string, oldState: any, newState: any) => {
  logger.debug(`State change in ${component}`, { 
    from: oldState, 
    to: newState 
  });
};

export const logNetworkRequest = (url: string, method: string, data?: any) => {
  logger.debug(`Network request: ${method} ${url}`, data);
};

export const logPlaybackEvent = (event: string, station?: string, data?: any) => {
  logger.info(`Playback: ${event}`, { station, ...data });
};