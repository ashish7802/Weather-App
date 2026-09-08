import React from 'react';
import { Calendar, Droplet, SunMedium } from 'lucide-react';
import { DailyForecastItem, TemperatureUnit } from '../types';
import {
  formatDayName,
  formatTemperature,
  getWeatherCondition,
} from '../utils/weatherUtils';

interface DailyForecastProps {
  daily: DailyForecastItem[];
  unit: TemperatureUnit;
}

export const DailyForecast: React.FC<DailyForecastProps> = ({ daily, unit }) => {
  if (!daily || daily.length === 0) return null;

  // Find min and max across all days to render accurate relative temperature bars
  const allMins = daily.map(d => d.minTemp);
  const allMaxs = daily.map(d => d.maxTemp);
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const tempSpan = globalMax - globalMin || 1;

  return (
    <div className="bg-slate-800/80 rounded-3xl p-5 sm:p-6 border border-slate-700/60 shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm sm:text-base font-bold text-white font-display">
            7-Day Weather Outlook
          </h3>
        </div>
        <span className="text-xs text-slate-400">Weekly trend</span>
      </div>

      <div className="divide-y divide-slate-700/50">
        {daily.map((day, idx) => {
          const condition = getWeatherCondition(day.weatherCode, true);
          const Icon = condition.icon;
          const isToday = idx === 0;

          // Bar offset and width percentage
          const leftPercent = Math.max(0, ((day.minTemp - globalMin) / tempSpan) * 100);
          const widthPercent = Math.max(8, ((day.maxTemp - day.minTemp) / tempSpan) * 100);

          return (
            <div
              key={day.date}
              className={`py-3 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 transition hover:bg-slate-700/20 px-2 rounded-xl ${
                isToday ? 'bg-sky-500/5 font-semibold' : ''
              }`}
            >
              {/* Day Name */}
              <div className="w-20 sm:w-28 shrink-0">
                <span className={`text-sm ${isToday ? 'text-sky-400 font-bold' : 'text-slate-200'}`}>
                  {formatDayName(day.date)}
                </span>
                <span className="block text-[11px] text-slate-500">
                  {day.date.slice(5)}
                </span>
              </div>

              {/* Weather Icon & Condition */}
              <div className="flex items-center gap-2 w-28 sm:w-36 shrink-0">
                <Icon className={`w-5 h-5 shrink-0 ${condition.iconColor}`} />
                <span className="text-xs text-slate-300 truncate hidden sm:inline">
                  {condition.label}
                </span>
              </div>

              {/* Rain Chance */}
              <div className="w-14 shrink-0 text-center">
                {day.precipitationProbability > 0 ? (
                  <span className="inline-flex items-center gap-0.5 text-xs text-sky-400">
                    <Droplet className="w-3 h-3 fill-current" />
                    {day.precipitationProbability}%
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">-</span>
                )}
              </div>

              {/* Min Temp */}
              <span className="text-xs sm:text-sm font-medium text-slate-400 w-10 text-right shrink-0">
                {formatTemperature(day.minTemp, unit)}
              </span>

              {/* Visual Temperature Range Bar */}
              <div className="flex-1 max-w-xs h-2 bg-slate-700/60 rounded-full relative overflow-hidden hidden md:block">
                <div
                  className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-rose-400"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                />
              </div>

              {/* Max Temp */}
              <span className="text-xs sm:text-sm font-bold text-white w-10 text-right shrink-0">
                {formatTemperature(day.maxTemp, unit)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
