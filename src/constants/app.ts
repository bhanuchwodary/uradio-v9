// Application Configuration Constants
export const APP_CONFIG = {
  NAME: 'uradio-v3-85',
  VERSION: '1.0.0',
  DESCRIPTION: 'Internet Radio Streaming App'
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  TRACKS: 'uradio-tracks',
  VOLUME: 'uradio-volume',
  THEME: 'uradio-theme',
  PLAYLIST: 'uradio-playlist',
  USER_PREFERENCES: 'uradio-preferences',
  RANDOM_MODE: 'uradio-random-mode'
} as const;

// Audio Configuration
export const AUDIO_CONFIG = {
  DEFAULT_VOLUME: 0.7,
  MIN_VOLUME: 0,
  MAX_VOLUME: 1,
  CROSSFADE_DURATION: 300,
  BUFFER_SIZE: 4096,
  PRELOAD: 'auto' as const
} as const;

// UI Configuration
export const UI_CONFIG = {
  TOAST_DURATION: 5000,
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 300,
  LOADING_TIMEOUT: 10000,
  MAX_STATIONS_PER_PAGE: 50
} as const;

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  LAZY_LOAD_THRESHOLD: 100,
  VIRTUAL_LIST_THRESHOLD: 100,
  IMAGE_LOADING_TIMEOUT: 5000,
  AUDIO_LOADING_TIMEOUT: 15000
} as const;

// Responsive Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  AUDIO_LOAD_FAILED: 'Failed to load audio stream.',
  STORAGE_FAILED: 'Failed to save data locally.',
  INVALID_URL: 'Invalid stream URL provided.',
  PERMISSION_DENIED: 'Permission denied.',
  TIMEOUT: 'Request timed out. Please try again.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  STATION_ADDED: 'Station added successfully',
  STATION_REMOVED: 'Station removed successfully',
  STATION_UPDATED: 'Station updated successfully',
  PLAYLIST_CLEARED: 'Playlist cleared successfully',
  SETTINGS_SAVED: 'Settings saved successfully'
} as const;

// Validation Rules
export const VALIDATION = {
  STATION_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100
  },
  STATION_URL: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2000
  },
  MAX_STATIONS: 1000,
  MAX_PLAYLIST_SIZE: 500
} as const;

// Animation Presets
export const ANIMATIONS = {
  FADE_IN: 'animate-fade-in',
  FADE_OUT: 'animate-fade-out',
  SCALE_IN: 'animate-scale-in',
  SLIDE_IN: 'animate-slide-in-right',
  BOUNCE: 'animate-bounce'
} as const;
