/**
 * Spotify Store
 * Manages Spotify connection state and listening data
 */

import { create } from 'zustand';
import { spotifyService, ListeningMood, SpotifyTrack } from '../services/spotify';

interface SpotifyState {
  // Connection
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Data
  currentTrack: SpotifyTrack | null;
  recentTracks: SpotifyTrack[];
  listeningMood: ListeningMood | null;
  moodScore: number | null;
  lastUpdated: number | null;

  // Actions
  checkConnection: () => Promise<void>;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  refreshData: () => Promise<void>;
  getCurrentTrack: () => Promise<void>;
}

export const useSpotifyStore = create<SpotifyState>((set, get) => ({
  // Initial state
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  currentTrack: null,
  recentTracks: [],
  listeningMood: null,
  moodScore: null,
  lastUpdated: null,

  /**
   * Check if Spotify is connected
   */
  checkConnection: async () => {
    const connected = await spotifyService.isConnected();
    set({ isConnected: connected });

    if (connected) {
      // Auto-refresh data if connected
      get().refreshData();
    }
  },

  /**
   * Connect to Spotify
   */
  connect: async () => {
    set({ isConnecting: true, connectionError: null });

    const result = await spotifyService.connect();

    if (result.success) {
      set({ isConnected: true, isConnecting: false });
      get().refreshData();
      return true;
    } else {
      set({
        isConnected: false,
        isConnecting: false,
        connectionError: result.error || 'Connection failed',
      });
      return false;
    }
  },

  /**
   * Disconnect from Spotify
   */
  disconnect: async () => {
    await spotifyService.disconnect();
    set({
      isConnected: false,
      currentTrack: null,
      recentTracks: [],
      listeningMood: null,
      moodScore: null,
      lastUpdated: null,
    });
  },

  /**
   * Refresh all Spotify data
   */
  refreshData: async () => {
    const isConnected = await spotifyService.isConnected();
    if (!isConnected) {
      set({ isConnected: false });
      return;
    }

    try {
      const [recentTracks, listeningMood, moodScore, currentTrack] = await Promise.all([
        spotifyService.getRecentlyPlayed(20),
        spotifyService.analyzeListeningMood(24),
        spotifyService.getMoodScore(),
        spotifyService.getCurrentlyPlaying(),
      ]);

      set({
        recentTracks,
        listeningMood,
        moodScore,
        currentTrack,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error('[SpotifyStore] Refresh failed:', error);
    }
  },

  /**
   * Get currently playing track
   */
  getCurrentTrack: async () => {
    const track = await spotifyService.getCurrentlyPlaying();
    set({ currentTrack: track });
  },
}));
