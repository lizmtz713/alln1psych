/**
 * Spotify Integration Service
 * Connects listening data to InGauge gauges
 */

import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

WebBrowser.maybeCompleteAuthSession();

// Spotify App Credentials
const SPOTIFY_CLIENT_ID = '936984876187441593360b1aecaf7064';
const SPOTIFY_SCOPES = [
  'user-read-recently-played',
  'user-top-read',
  'user-read-currently-playing',
  'user-read-playback-state',
].join(' ');

const STORAGE_KEYS = {
  accessToken: 'spotify_access_token',
  refreshToken: 'spotify_refresh_token',
  tokenExpiry: 'spotify_token_expiry',
};

// Discovery document for Spotify
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

// Types
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  played_at?: string;
}

export interface AudioFeatures {
  id: string;
  valence: number;      // 0-1: musical positiveness (happiness)
  energy: number;       // 0-1: intensity and activity
  danceability: number; // 0-1: how suitable for dancing
  tempo: number;        // BPM
  acousticness: number; // 0-1: acoustic vs electronic
  instrumentalness: number;
  loudness: number;     // dB
  mode: number;         // 0 = minor, 1 = major
  key: number;          // 0-11 pitch class
}

export interface ListeningMood {
  averageValence: number;
  averageEnergy: number;
  moodLabel: string;
  trackCount: number;
  dominantGenres?: string[];
}

class SpotifyService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  /**
   * Get redirect URI based on platform
   */
  private getRedirectUri(): string {
    return AuthSession.makeRedirectUri({
      scheme: 'alln1-psych', // matches app.json scheme
      path: 'spotify-callback',
    });
  }

  /**
   * Check if user is connected to Spotify
   */
  async isConnected(): Promise<boolean> {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.accessToken);
    const expiry = await AsyncStorage.getItem(STORAGE_KEYS.tokenExpiry);
    
    if (!token || !expiry) return false;
    
    // Check if token is expired (with 5 min buffer)
    const isExpired = Date.now() > (parseInt(expiry) - 5 * 60 * 1000);
    return !isExpired;
  }

  /**
   * Start OAuth flow to connect Spotify
   */
  async connect(): Promise<{ success: boolean; error?: string }> {
    try {
      const redirectUri = this.getRedirectUri();
      
      const request = new AuthSession.AuthRequest({
        clientId: SPOTIFY_CLIENT_ID,
        scopes: SPOTIFY_SCOPES.split(' '),
        redirectUri,
        usePKCE: true,
      });

      const result = await request.promptAsync(discovery);

      if (result.type === 'success' && result.params.code) {
        // Exchange code for tokens
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: SPOTIFY_CLIENT_ID,
            code: result.params.code,
            redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier || '',
            },
          },
          discovery
        );

        // Store tokens
        await AsyncStorage.setItem(STORAGE_KEYS.accessToken, tokenResponse.accessToken);
        if (tokenResponse.refreshToken) {
          await AsyncStorage.setItem(STORAGE_KEYS.refreshToken, tokenResponse.refreshToken);
        }
        const expiry = Date.now() + (tokenResponse.expiresIn || 3600) * 1000;
        await AsyncStorage.setItem(STORAGE_KEYS.tokenExpiry, expiry.toString());

        this.accessToken = tokenResponse.accessToken;
        this.tokenExpiry = expiry;

        return { success: true };
      }

      return { success: false, error: 'Authorization cancelled' };
    } catch (error) {
      if (__DEV__) console.error('[Spotify] Connect error:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Disconnect Spotify (clear tokens)
   */
  async disconnect(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.accessToken,
      STORAGE_KEYS.refreshToken,
      STORAGE_KEYS.tokenExpiry,
    ]);
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get valid access token (refresh if needed)
   */
  private async getAccessToken(): Promise<string | null> {
    // Check memory cache first
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    // Try stored token
    const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.accessToken);
    const storedExpiry = await AsyncStorage.getItem(STORAGE_KEYS.tokenExpiry);

    if (storedToken && storedExpiry) {
      const expiry = parseInt(storedExpiry);
      if (Date.now() < expiry - 60000) {
        this.accessToken = storedToken;
        this.tokenExpiry = expiry;
        return storedToken;
      }

      // Try to refresh
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.refreshToken);
      if (refreshToken) {
        try {
          const response = await AuthSession.refreshAsync(
            {
              clientId: SPOTIFY_CLIENT_ID,
              refreshToken,
            },
            discovery
          );

          await AsyncStorage.setItem(STORAGE_KEYS.accessToken, response.accessToken);
          const newExpiry = Date.now() + (response.expiresIn || 3600) * 1000;
          await AsyncStorage.setItem(STORAGE_KEYS.tokenExpiry, newExpiry.toString());

          this.accessToken = response.accessToken;
          this.tokenExpiry = newExpiry;

          return response.accessToken;
        } catch (error) {
          if (__DEV__) console.error('[Spotify] Token refresh failed:', error);
        }
      }
    }

    return null;
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest<T>(endpoint: string): Promise<T | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (__DEV__) console.error('[Spotify] API error:', response.status);
        return null;
      }

      return response.json();
    } catch (error) {
      if (__DEV__) console.error('[Spotify] API request failed:', error);
      return null;
    }
  }

  /**
   * Get recently played tracks
   */
  async getRecentlyPlayed(limit: number = 50): Promise<SpotifyTrack[]> {
    const data = await this.apiRequest<{
      items: { track: SpotifyTrack; played_at: string }[];
    }>(`/me/player/recently-played?limit=${limit}`);

    if (!data?.items) return [];

    return data.items.map((item) => ({
      ...item.track,
      played_at: item.played_at,
    }));
  }

  /**
   * Get currently playing track
   */
  async getCurrentlyPlaying(): Promise<SpotifyTrack | null> {
    const data = await this.apiRequest<{
      item: SpotifyTrack;
      is_playing: boolean;
    }>('/me/player/currently-playing');

    return data?.item || null;
  }

  /**
   * Get audio features for tracks
   */
  async getAudioFeatures(trackIds: string[]): Promise<AudioFeatures[]> {
    if (trackIds.length === 0) return [];

    // Spotify allows max 100 IDs per request
    const ids = trackIds.slice(0, 100).join(',');
    const data = await this.apiRequest<{ audio_features: AudioFeatures[] }>(
      `/audio-features?ids=${ids}`
    );

    return data?.audio_features?.filter(Boolean) || [];
  }

  /**
   * Get user's top tracks
   */
  async getTopTracks(
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'short_term',
    limit: number = 20
  ): Promise<SpotifyTrack[]> {
    const data = await this.apiRequest<{ items: SpotifyTrack[] }>(
      `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
    );

    return data?.items || [];
  }

  /**
   * Analyze recent listening mood
   * Returns aggregated mood data from recent tracks
   */
  async analyzeListeningMood(hoursBack: number = 24): Promise<ListeningMood | null> {
    const recentTracks = await this.getRecentlyPlayed(50);
    if (recentTracks.length === 0) return null;

    // Filter to tracks within time window
    const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;
    const relevantTracks = recentTracks.filter((track) => {
      if (!track.played_at) return true;
      return new Date(track.played_at).getTime() > cutoff;
    });

    if (relevantTracks.length === 0) return null;

    // Get audio features
    const trackIds = relevantTracks.map((t) => t.id);
    const features = await this.getAudioFeatures(trackIds);

    if (features.length === 0) return null;

    // Calculate averages
    const avgValence = features.reduce((sum, f) => sum + f.valence, 0) / features.length;
    const avgEnergy = features.reduce((sum, f) => sum + f.energy, 0) / features.length;

    // Determine mood label based on valence + energy quadrant
    let moodLabel: string;
    if (avgValence >= 0.5 && avgEnergy >= 0.5) {
      moodLabel = 'Energized & Positive';
    } else if (avgValence >= 0.5 && avgEnergy < 0.5) {
      moodLabel = 'Peaceful & Content';
    } else if (avgValence < 0.5 && avgEnergy >= 0.5) {
      moodLabel = 'Intense & Turbulent';
    } else {
      moodLabel = 'Melancholic & Reflective';
    }

    return {
      averageValence: Math.round(avgValence * 100) / 100,
      averageEnergy: Math.round(avgEnergy * 100) / 100,
      moodLabel,
      trackCount: features.length,
    };
  }

  /**
   * Get mood score (0-100) from listening data
   * Can be used to influence or compare with Emotion gauge
   */
  async getMoodScore(): Promise<number | null> {
    const mood = await this.analyzeListeningMood(24);
    if (!mood) return null;

    // Weighted combination: valence matters more for "mood"
    const score = (mood.averageValence * 0.7 + mood.averageEnergy * 0.3) * 100;
    return Math.round(score);
  }
}

export const spotifyService = new SpotifyService();
