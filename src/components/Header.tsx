import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Compass,
  RotateCw,
  X,
  Loader2,
  CloudSun,
  Key,
} from 'lucide-react';
import { LocationInfo, SearchResultItem, TemperatureUnit, WindSpeedUnit } from '../types';
import { searchLocations, getConfiguredApiKey } from '../services/weatherApi';
import { ApiKeyModal } from './ApiKeyModal';

interface HeaderProps {
  currentLocation: LocationInfo;
  onSelectLocation: (loc: LocationInfo) => void;
  onRequestGeolocation: () => void;
  isLocating: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  unit: TemperatureUnit;
  onToggleUnit: (unit: TemperatureUnit) => void;
  windUnit: WindSpeedUnit;
  onToggleWindUnit: (unit: WindSpeedUnit) => void;
  currentProvider?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onSelectLocation,
  onRequestGeolocation,
  isLocating,
  onRefresh,
  isRefreshing,
  unit,
  onToggleUnit,
  windUnit,
  onToggleWindUnit,
  currentProvider,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasApiKey(Boolean(getConfiguredApiKey()));
  }, [isKeyModalOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const data = await searchLocations(query);
        setResults(data);
        setIsOpen(true);
        if (data.length === 0) {
          setSearchError('No matching locations found');
        }
      } catch (err) {
        setSearchError('Search failed, please check connection');
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResultItem) => {
    onSelectLocation({
      name: item.name,
      region: item.admin1,
      country: item.country,
      countryCode: item.country_code,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone,
      isCurrentLocation: false,
    });
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          
          {/* Brand / Logo */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
                <CloudSun className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-display">
                  Weather Forecast
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Live conditions & atmosphere
                </p>
              </div>
            </div>

            {/* Mobile Quick Action toggles */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(true)}
                className={`p-1.5 rounded-lg border transition ${
                  hasApiKey
                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="Configure Weather API Key"
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                id="mobile-unit-toggle"
                type="button"
                onClick={() => onToggleUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title="Toggle Temperature Unit"
              >
                °{unit === 'celsius' ? 'C' : 'F'}
              </button>
              <button
                id="mobile-refresh-btn"
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition disabled:opacity-50"
                title="Refresh weather"
              >
                <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Search Bar & Auto-Suggest */}
          <div ref={wrapperRef} className="relative w-full md:max-w-md flex-1">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="location-search-input"
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => {
                  if (results.length > 0) setIsOpen(true);
                }}
                placeholder="Search city, region or country..."
                className="w-full pl-10 pr-20 py-2 text-sm bg-slate-800/90 hover:bg-slate-800 focus:bg-slate-800 text-slate-100 placeholder-slate-400 rounded-xl border border-slate-700/80 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition shadow-inner"
              />
              <div className="absolute right-2.5 flex items-center gap-1">
                {isSearching && (
                  <Loader2 className="w-4 h-4 text-sky-400 animate-spin mr-1" />
                )}
                {query && !isSearching && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-200 transition"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  id="btn-use-my-location"
                  type="button"
                  onClick={onRequestGeolocation}
                  disabled={isLocating}
                  title="Detect my location via GPS"
                  className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition disabled:opacity-50"
                >
                  {isLocating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Compass className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">GPS</span>
                </button>
              </div>
            </div>

            {/* Autocomplete Dropdown */}
            {isOpen && (results.length > 0 || searchError) && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-700 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                {searchError ? (
                  <div className="p-3 text-xs text-slate-400 text-center">
                    {searchError}
                  </div>
                ) : (
                  <ul className="max-h-64 overflow-y-auto divide-y divide-slate-700/50">
                    {results.map((item) => (
                      <li key={`${item.id}-${item.latitude}-${item.longitude}`}>
                        <button
                          type="button"
                          onClick={() => handleSelect(item)}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-700/60 transition flex items-center justify-between text-sm group"
                        >
                          <div className="flex items-center gap-2.5">
                            <MapPin className="w-4 h-4 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-slate-100">{item.name}</span>
                            {item.admin1 && (
                              <span className="text-xs text-slate-400 truncate max-w-[130px]">
                                {item.admin1}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                            {item.country}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Desktop Controls (API Key, Unit Toggle & Refresh) */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* API Key Modal Button */}
            <button
              type="button"
              onClick={() => setIsKeyModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                hasApiKey
                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Weather API Key settings"
            >
              <Key className={`w-3.5 h-3.5 ${hasApiKey ? 'text-sky-400' : 'text-slate-400'}`} />
              <span>{hasApiKey ? 'API Key Active' : 'API Key'}</span>
            </button>

            {/* Temperature Unit Toggle */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/80 text-xs font-semibold">
              <button
                id="unit-celsius-btn"
                type="button"
                onClick={() => onToggleUnit('celsius')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  unit === 'celsius'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                °C
              </button>
              <button
                id="unit-fahrenheit-btn"
                type="button"
                onClick={() => onToggleUnit('fahrenheit')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  unit === 'fahrenheit'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                °F
              </button>
            </div>

            {/* Wind Speed Unit Toggle */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/80 text-xs font-semibold">
              <button
                id="wind-kmh-btn"
                type="button"
                onClick={() => onToggleWindUnit('kmh')}
                className={`px-2 py-1 rounded-lg transition ${
                  windUnit === 'kmh'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                km/h
              </button>
              <button
                id="wind-mph-btn"
                type="button"
                onClick={() => onToggleWindUnit('mph')}
                className={`px-2 py-1 rounded-lg transition ${
                  windUnit === 'mph'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                mph
              </button>
            </div>

            {/* Refresh Button */}
            <button
              id="desktop-refresh-btn"
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
              title="Refresh current weather data"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onSave={onRefresh}
        currentProvider={currentProvider}
      />
    </>
  );
};

