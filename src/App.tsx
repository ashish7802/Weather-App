/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Compass,
  MapPin,
  Sparkles,
  CloudSun,
} from 'lucide-react';
import { Header } from './components/Header';
import { CurrentWeatherCard } from './components/CurrentWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { WeatherMetricsGrid } from './components/WeatherMetricsGrid';
import { RecentSearches } from './components/RecentSearches';
import { WeatherAdvisoryBanner } from './components/WeatherAdvisoryBanner';
import { LocationInfo, TemperatureUnit, WeatherData, WindSpeedUnit } from './types';
import { fetchWeatherData, reverseGeocode, POPULAR_LOCATIONS } from './services/weatherApi';

const DEFAULT_LOCATION: LocationInfo = POPULAR_LOCATIONS[0]; // Tokyo (or London/New York)

export default function App() {
  const [currentLocation, setCurrentLocation] = useState<LocationInfo>(() => {
    try {
      const saved = localStorage.getItem('weather_last_location');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved location', e);
    }
    return DEFAULT_LOCATION;
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  const [unit, setUnit] = useState<TemperatureUnit>(() => {
    return (localStorage.getItem('weather_unit') as TemperatureUnit) || 'celsius';
  });

  const [windUnit, setWindUnit] = useState<WindSpeedUnit>(() => {
    return (localStorage.getItem('weather_wind_unit') as WindSpeedUnit) || 'kmh';
  });

  const [recentLocations, setRecentLocations] = useState<LocationInfo[]>(() => {
    try {
      const saved = localStorage.getItem('weather_recent_locations');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Persist units
  const handleToggleUnit = (newUnit: TemperatureUnit) => {
    setUnit(newUnit);
    localStorage.setItem('weather_unit', newUnit);
  };

  const handleToggleWindUnit = (newWindUnit: WindSpeedUnit) => {
    setWindUnit(newWindUnit);
    localStorage.setItem('weather_wind_unit', newWindUnit);
  };

  // Add to recents
  const addToRecents = (loc: LocationInfo) => {
    setRecentLocations((prev) => {
      const filtered = prev.filter(
        (p) => !(p.name.toLowerCase() === loc.name.toLowerCase() && p.country.toLowerCase() === loc.country.toLowerCase())
      );
      const updated = [loc, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('weather_recent_locations', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const handleClearRecent = () => {
    setRecentLocations([]);
    localStorage.removeItem('weather_recent_locations');
  };

  // Load weather for a location
  const loadWeather = useCallback(async (loc: LocationInfo, showRefreshSpinner = false) => {
    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await fetchWeatherData(loc);
      setWeatherData(data);
      setCurrentLocation(loc);
      try {
        localStorage.setItem('weather_last_location', JSON.stringify(loc));
      } catch (e) {
        console.warn(e);
      }
      if (!loc.isCurrentLocation) {
        addToRecents(loc);
      }
    } catch (err: any) {
      console.error('Weather load error:', err);
      setError(err?.message || 'Unable to fetch weather data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Request browser geolocation
  const handleRequestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationNotice('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const geoInfo = await reverseGeocode(latitude, longitude);
          const locationObj: LocationInfo = {
            name: geoInfo.name,
            region: geoInfo.region,
            country: geoInfo.country,
            countryCode: geoInfo.countryCode,
            latitude,
            longitude,
            isCurrentLocation: true,
          };
          await loadWeather(locationObj);
        } catch (err) {
          console.error(err);
          // Fallback with coordinates
          const fallbackLoc: LocationInfo = {
            name: 'Local Position',
            country: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
            latitude,
            longitude,
            isCurrentLocation: true,
          };
          await loadWeather(fallbackLoc);
        } finally {
          setIsLocating(false);
        }
      },
      (geoError) => {
        setIsLocating(false);
        let msg = 'Could not retrieve your location.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can search any city in the search bar above.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (geoError.code === geoError.TIMEOUT) {
          msg = 'Location request timed out. Please try again or search by city name.';
        }
        setLocationNotice(msg);
      },
      {
        enableHighAccuracy: false,
        timeout: 9000,
        maximumAge: 60000,
      }
    );
  }, [loadWeather]);

  // Initial load
  useEffect(() => {
    loadWeather(currentLocation);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30">
      
      {/* Top Navigation & Search Bar */}
      <Header
        currentLocation={currentLocation}
        onSelectLocation={(loc) => loadWeather(loc)}
        onRequestGeolocation={handleRequestGeolocation}
        isLocating={isLocating}
        onRefresh={() => loadWeather(currentLocation, true)}
        isRefreshing={isRefreshing}
        unit={unit}
        onToggleUnit={handleToggleUnit}
        windUnit={windUnit}
        onToggleWindUnit={handleToggleWindUnit}
        currentProvider={weatherData?.provider}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Popular / Recent Locations Strip */}
        <div className="bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
          <RecentSearches
            recentLocations={recentLocations}
            currentLocation={currentLocation}
            onSelect={(loc) => loadWeather(loc)}
            onClearRecent={handleClearRecent}
          />
        </div>

        {/* Location Notice (Permission denied / feedback banner) */}
        {locationNotice && (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{locationNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setLocationNotice(null)}
              className="text-xs font-semibold px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 transition"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => loadWeather(currentLocation)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 text-xs font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner Skeleton */}
        {isLoading && !weatherData && (
          <div className="min-h-[420px] flex flex-col items-center justify-center gap-4 bg-slate-900/40 rounded-3xl border border-slate-800/60 p-8">
            <div className="relative">
              <CloudSun className="w-14 h-14 text-sky-400 animate-pulse" />
              <Loader2 className="w-6 h-6 text-sky-400 animate-spin absolute -bottom-1 -right-1" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white font-display">
                Fetching weather data...
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Querying meteorological forecast models for {currentLocation.name}
              </p>
            </div>
          </div>
        )}

        {/* Weather Content */}
        {weatherData && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Primary Hero Card */}
            <CurrentWeatherCard
              data={weatherData}
              unit={unit}
              windUnit={windUnit}
            />

            {/* Weather Advisory / Highlight Banner */}
            <WeatherAdvisoryBanner
              data={weatherData}
              unit={unit}
              windUnit={windUnit}
            />

            {/* 24-Hour Hourly Timeline */}
            <HourlyForecast
              hourly={weatherData.hourly}
              unit={unit}
            />

            {/* Atmospheric Metrics Grid (Solar cycle, UV, Wind Dial, Pressure) */}
            <WeatherMetricsGrid
              data={weatherData}
              unit={unit}
              windUnit={windUnit}
            />

            {/* 7-Day Extended Forecast */}
            <DailyForecast
              daily={weatherData.daily}
              unit={unit}
            />

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 px-4 sm:px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-1.5">
            <span>Powered by</span>
            <span className="text-sky-400 font-medium">
              {weatherData?.provider || 'Weather Meteorological API'}
            </span>
            <span>• High-resolution atmospheric forecast</span>
          </p>
          <p className="text-slate-400">
            Real-time weather conditions, forecasts, and atmospheric tracking
          </p>
        </div>
      </footer>

    </div>
  );
}
