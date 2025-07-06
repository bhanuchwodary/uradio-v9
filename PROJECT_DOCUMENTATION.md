
# Streamify Jukebox Documentation

## Project Overview
Streamify Jukebox is a modern web application for streaming radio stations and managing audio playback. Built with React, TypeScript, and TailwindCSS, it provides a responsive and intuitive user interface for managing and playing audio streams.

## Key Features
- Responsive layout that adapts to all screen sizes
- Audio streaming with HLS support
- Favorite stations management
- Recent stations tracking
- Dark/Light theme support
- Mobile-friendly interface

## Technical Architecture

### Core Technologies
- React + TypeScript for the frontend
- TailwindCSS for styling
- ShadcnUI for UI components
- HLS.js for streaming
- React Router for navigation
- React Query for state management

### Component Structure

#### 1. MusicPlayer Component
The central component for audio playback, handling:
- Stream playback control
- Volume control
- Track progress
- HLS stream support
- Media session integration

#### 2. FavoriteStations Component
Displays user's favorite stations in a responsive grid layout:
- Station cards with clickable icons
- Visual feedback on interaction
- Responsive grid layout
- Favorite status indication

#### 3. Navigation Component
Handles app navigation with:
- Responsive mobile/desktop layouts
- Theme toggle
- Route management

### State Management

#### 1. useMusicPlayer Hook
Central hook for managing playback state:
- Current track management
- Play/pause control
- Track list management
- Favorite status tracking

#### 2. useTrackState Hook
Manages the list of tracks and their states:
- Add/remove tracks
- Toggle favorites
- Track metadata management

#### 3. usePlaybackState Hook
Handles playback-specific state:
- Current position
- Duration
- Seek functionality

### Responsive Design
The application implements a fluid design system:
- Mobile-first approach
- Responsive grids (2-5 columns based on screen size)
- Flexible spacing with responsive padding/margins
- Adaptive layouts for different screen sizes
- Container queries for component-level responsiveness

### Theme System
- System/Light/Dark mode support
- Consistent color scheme
- Glass morphism effects
- High contrast accessibility

## File Structure
```
src/
├── components/         # React components
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── types/             # TypeScript definitions
├── services/          # Audio and platform services
└── utils/             # Utility functions
```

## Best Practices
1. Component Composition
   - Small, focused components
   - Clear props interfaces
   - Consistent styling patterns

2. State Management
   - Centralized audio state
   - Persistent favorites
   - Efficient updates

3. Performance
   - Lazy loading
   - Memoized components
   - Efficient re-renders

4. Accessibility
   - ARIA labels
   - Keyboard navigation
   - Focus management

## Development Guidelines
1. Use TypeScript for all new components
2. Follow the existing styling patterns
3. Maintain responsive design principles
4. Test across different screen sizes
5. Keep components small and focused

## Future Improvements
1. Offline support
2. Station search functionality
3. Custom playlists
4. Enhanced mobile features
5. Audio visualizations
