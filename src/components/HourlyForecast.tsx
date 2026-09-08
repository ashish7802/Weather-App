import React from 'react';
import { Clock, Droplet } from 'lucide-react';
import { HourlyForecastItem, TemperatureUnit } from '../types';
import {
  formatHourOnly,
  formatTemperature,
  getWeatherCondition,
} from '../utils/weatherUtils';

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  unit: TemperatureUnit;
}

export const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourly, unit }) => {
  if (!hourly || hourly.length === 0) return null;

  return (
    <div className="bg-slate-800/80 rounded-3xl p-5 sm:p-6 border border-slate-700/60 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm sm:text-base font-bold text-white font-display">
            24-Hour Hourly Forecast
          </h3>
        </div>
        <span className="text-xs text-slate-400">Scroll horizontally →</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {hourly.map((hour, idx) => {
          const condition = getWeatherCondition(hour.weatherCode, hour.isDay);
          const Icon = condition.icon;
          const isNow = idx === 0;

          return (
            <div
              key={hour.time}
              className={`flex flex-col items-center justify-between min-w-[76px] sm:min-w-[84px] p-3 rounded-2xl border transition-all text-center ${
                isNow
                  ? 'bg-sky-500/15 border-sky-500/40 text-white shadow-md'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-700/60 text-slate-200'
              }`}
            >
              <span className={`text-xs font-semibold ${isNow ? 'text-sky-300' : 'text-slate-400'}`}>
                {isNow ? 'Now' : formatHourOnly(hour.time)}
              </span>

              <div className="my-2.5">
                <Icon className={`w-7 h-7 mx-auto ${condition.iconColor}`} />
              </div>

              <span className="text-base font-bold text-white font-display">
                {formatTemperature(hour.temperature, unit)}
              </span>

              {/* Rain chance badge */}
              <div className="mt-2 min-h-[20px] flex items-center justify-center">
                {hour.precipitationProbability > 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded-full">
                    <Droplet className="w-2.5 h-2.5 fill-current" />
                    {hour.precipitationProbability}%
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">-</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
