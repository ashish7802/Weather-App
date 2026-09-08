import React from 'react';
import { History, MapPin, Sparkles } from 'lucide-react';
import { LocationInfo } from '../types';
import { POPULAR_LOCATIONS } from '../services/weatherApi';

interface RecentSearchesProps {
  recentLocations: LocationInfo[];
  currentLocation: LocationInfo;
  onSelect: (location: LocationInfo) => void;
  onClearRecent: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  recentLocations,
  currentLocation,
  onSelect,
  onClearRecent,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
      
      {/* Popular City Quick-links */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Popular:
        </span>
        {POPULAR_LOCATIONS.map((city) => {
          const isSelected =
            currentLocation.name.toLowerCase() === city.name.toLowerCase() &&
            currentLocation.country.toLowerCase() === city.country.toLowerCase();

          return (
            <button
              key={city.name}
              type="button"
              onClick={() => onSelect(city)}
              className={`px-3 py-1 rounded-xl transition font-medium border ${
                isSelected
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/70 hover:border-slate-600'
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>

      {/* Recents list if available */}
      {recentLocations.length > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <History className="w-3 h-3 text-slate-400" />
            Recent:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {recentLocations.slice(0, 3).map((loc) => (
              <button
                key={`${loc.name}-${loc.latitude}`}
                type="button"
                onClick={() => onSelect(loc)}
                className="px-2.5 py-0.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 border border-slate-700 text-xs transition truncate max-w-[120px]"
                title={`${loc.name}, ${loc.country}`}
              >
                {loc.name}
              </button>
            ))}
            <button
              type="button"
              onClick={onClearRecent}
              className="text-[10px] text-slate-400 hover:text-slate-300 underline underline-offset-2 ml-1"
            >
              Clear
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
