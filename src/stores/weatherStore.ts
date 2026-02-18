/**
 * Weather Store
 * Manages weather data for mood correlation
 */

import { create } from 'zustand';
import { weatherService, WeatherData, WeatherContext } from '../services/weather';

interface WeatherState {
  // Status
  isConfigured: boolean;
  isLoading: boolean;
  error: string | null;

  // Data
  weather: WeatherData | null;
  lastUpdated: number | null;

  // Actions
  checkConfiguration: () => Promise<void>;
  setApiKey: (key: string) => Promise<boolean>;
  refreshWeather: () => Promise<void>;
  getWeatherContext: () => WeatherContext | null;
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  isConfigured: false,
  isLoading: false,
  error: null,
  weather: null,
  lastUpdated: null,

  checkConfiguration: async () => {
    const configured = await weatherService.isConfigured();
    set({ isConfigured: configured });

    if (configured) {
      get().refreshWeather();
    }
  },

  setApiKey: async (key: string) => {
    try {
      await weatherService.setApiKey(key);
      set({ isConfigured: true, error: null });
      
      // Try to fetch weather to validate key
      const weather = await weatherService.fetchWeather(true);
      if (weather) {
        set({ weather, lastUpdated: Date.now() });
        return true;
      } else {
        set({ error: 'Could not fetch weather. Check your API key.' });
        return false;
      }
    } catch (e) {
      set({ error: 'Invalid API key' });
      return false;
    }
  },

  refreshWeather: async () => {
    set({ isLoading: true, error: null });

    try {
      const weather = await weatherService.fetchWeather(true);
      if (weather) {
        set({ weather, lastUpdated: Date.now(), isLoading: false });
      } else {
        set({ error: 'Could not fetch weather', isLoading: false });
      }
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  getWeatherContext: () => {
    const { weather } = get();
    if (!weather) return null;

    return {
      temperature: weather.temperature,
      humidity: weather.humidity,
      pressure: weather.pressure,
      description: weather.description,
      lightLevel: weather.lightLevel,
      moodImpact: weather.moodImpact,
    };
  },
}));
