/**
 * Weather Service
 * Fetches weather data for mood correlation
 * Uses OpenWeatherMap API (free tier: 1000 calls/day)
 */

import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Free tier API key - users can add their own in settings for higher limits
const DEFAULT_API_KEY = ''; // Will prompt user to add key
const STORAGE_KEYS = {
  apiKey: 'weather_api_key',
  lastWeather: 'weather_last_data',
  lastFetch: 'weather_last_fetch',
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export interface WeatherData {
  temperature: number;        // Fahrenheit
  feelsLike: number;
  humidity: number;           // percentage
  pressure: number;           // hPa (barometric)
  description: string;        // "partly cloudy"
  icon: string;               // weather icon code
  windSpeed: number;          // mph
  visibility: number;         // miles
  uvIndex?: number;
  cloudCover: number;         // percentage
  sunrise: number;            // unix timestamp
  sunset: number;
  isDay: boolean;
  
  // Mood-relevant derived values
  pressureChange?: 'rising' | 'falling' | 'stable';
  lightLevel: 'bright' | 'overcast' | 'dark';
  moodImpact: 'positive' | 'neutral' | 'negative';
}

export interface WeatherContext {
  temperature?: number;
  humidity?: number;
  pressure?: number;
  description?: string;
  lightLevel?: string;
  moodImpact?: string;
  uvIndex?: number;
}

class WeatherService {
  private cachedWeather: WeatherData | null = null;
  private lastFetchTime: number = 0;

  /**
   * Set custom API key
   */
  async setApiKey(key: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.apiKey, key);
  }

  /**
   * Get API key (user's or prompt to add)
   */
  async getApiKey(): Promise<string | null> {
    const key = await AsyncStorage.getItem(STORAGE_KEYS.apiKey);
    return key || null;
  }

  /**
   * Check if weather is configured
   */
  async isConfigured(): Promise<boolean> {
    const key = await this.getApiKey();
    return !!key;
  }

  /**
   * Get current location
   */
  private async getLocation(): Promise<{ lat: number; lon: number } | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low, // Low accuracy is fine for weather
      });

      return {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      };
    } catch (error) {
      console.error('[Weather] Location error:', error);
      return null;
    }
  }

  /**
   * Fetch weather data from OpenWeatherMap
   */
  async fetchWeather(forceRefresh = false): Promise<WeatherData | null> {
    // Check cache
    if (!forceRefresh && this.cachedWeather && Date.now() - this.lastFetchTime < CACHE_DURATION) {
      return this.cachedWeather;
    }

    // Check for cached data in storage
    if (!forceRefresh) {
      try {
        const cachedData = await AsyncStorage.getItem(STORAGE_KEYS.lastWeather);
        const cachedTime = await AsyncStorage.getItem(STORAGE_KEYS.lastFetch);
        if (cachedData && cachedTime && Date.now() - parseInt(cachedTime) < CACHE_DURATION) {
          this.cachedWeather = JSON.parse(cachedData);
          this.lastFetchTime = parseInt(cachedTime);
          return this.cachedWeather;
        }
      } catch (e) {
        // Continue to fetch
      }
    }

    const apiKey = await this.getApiKey();
    if (!apiKey) return null;

    const location = await this.getLocation();
    if (!location) return null;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=imperial`
      );

      if (!response.ok) {
        console.error('[Weather] API error:', response.status);
        return null;
      }

      const data = await response.json();
      const weather = this.parseWeatherData(data);

      // Cache it
      this.cachedWeather = weather;
      this.lastFetchTime = Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.lastWeather, JSON.stringify(weather));
      await AsyncStorage.setItem(STORAGE_KEYS.lastFetch, this.lastFetchTime.toString());

      return weather;
    } catch (error) {
      console.error('[Weather] Fetch error:', error);
      return null;
    }
  }

  /**
   * Parse OpenWeatherMap response into our format
   */
  private parseWeatherData(data: any): WeatherData {
    const now = Math.floor(Date.now() / 1000);
    const isDay = now > data.sys.sunrise && now < data.sys.sunset;
    const cloudCover = data.clouds?.all || 0;

    // Determine light level
    let lightLevel: 'bright' | 'overcast' | 'dark';
    if (!isDay) {
      lightLevel = 'dark';
    } else if (cloudCover > 70) {
      lightLevel = 'overcast';
    } else {
      lightLevel = 'bright';
    }

    // Determine mood impact based on weather
    let moodImpact: 'positive' | 'neutral' | 'negative';
    const desc = data.weather[0]?.main?.toLowerCase() || '';
    const temp = data.main.temp;

    if (lightLevel === 'bright' && temp >= 60 && temp <= 80) {
      moodImpact = 'positive';
    } else if (desc.includes('rain') || desc.includes('storm') || lightLevel === 'dark' || cloudCover > 80) {
      moodImpact = 'negative';
    } else {
      moodImpact = 'neutral';
    }

    return {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      description: data.weather[0]?.description || 'unknown',
      icon: data.weather[0]?.icon || '01d',
      windSpeed: Math.round(data.wind?.speed || 0),
      visibility: Math.round((data.visibility || 10000) / 1609), // meters to miles
      cloudCover,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      isDay,
      lightLevel,
      moodImpact,
    };
  }

  /**
   * Get weather context for cockpit AI
   */
  async getWeatherContext(): Promise<WeatherContext | null> {
    const weather = await this.fetchWeather();
    if (!weather) return null;

    return {
      temperature: weather.temperature,
      humidity: weather.humidity,
      pressure: weather.pressure,
      description: weather.description,
      lightLevel: weather.lightLevel,
      moodImpact: weather.moodImpact,
    };
  }

  /**
   * Get mood-relevant weather summary
   */
  getMoodSummary(weather: WeatherData): string {
    const parts: string[] = [];

    // Temperature comfort
    if (weather.temperature < 40) {
      parts.push('cold');
    } else if (weather.temperature > 85) {
      parts.push('hot');
    }

    // Light
    if (weather.lightLevel === 'overcast') {
      parts.push('overcast/gray');
    } else if (weather.lightLevel === 'dark') {
      parts.push('dark');
    } else {
      parts.push('sunny');
    }

    // Pressure (affects headaches, mood)
    if (weather.pressure < 1000) {
      parts.push('low pressure');
    } else if (weather.pressure > 1025) {
      parts.push('high pressure');
    }

    // Humidity
    if (weather.humidity > 80) {
      parts.push('humid');
    } else if (weather.humidity < 30) {
      parts.push('dry');
    }

    return parts.join(', ') || weather.description;
  }
}

export const weatherService = new WeatherService();
