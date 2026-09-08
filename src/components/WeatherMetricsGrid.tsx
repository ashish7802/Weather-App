import React from 'react';
import {
  Sunrise,
  Sunset,
  Sun,
  Compass,
  Gauge,
  Droplets,
  CloudRain,
  ShieldAlert,
  Wind,
} from 'lucide-react';
import { TemperatureUnit, WeatherData, WindSpeedUnit } from '../types';
import {
  formatTemperature,
  formatTimeShort,
  formatWindSpeed,
  getUvIndexInfo,
  getWindDirection,
} from '../utils/weatherUtils';

interface WeatherMetricsGridProps {
  data: WeatherData;
  unit: TemperatureUnit;
  windUnit: WindSpeedUnit;
}

export const WeatherMetricsGrid: React.FC<WeatherMetricsGridProps> = ({
  data,
  unit,
  windUnit,
}) => {
  const { current, daily } = data;
  const today = daily[0];
  const uvInfo = getUvIndexInfo(current.uvIndex);

  // Approximate dew point using Magnus formula
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * current.temperature) / (b + current.temperature)) + Math.log(current.relativeHumidity / 100);
  const dewPoint = (b * alpha) / (a - alpha);

  // Calculate daylight duration if sunrise and sunset available
  let daylightStr = '';
  if (today?.sunrise && today?.sunset) {
    try {
      const rise = new Date(today.sunrise).getTime();
      const set = new Date(today.sunset).getTime();
      const diffMs = set - rise;
      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        daylightStr = `${hours}h ${minutes}m daylight`;
      }
    } catch {
      daylightStr = '';
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      
      {/* 1. Sunrise & Sunset */}
      <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700/60 shadow-lg backdrop-blur-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <Sunrise className="w-4 h-4 text-amber-400" />
            Solar Cycle
          </span>
          {daylightStr && <span>{daylightStr}</span>}
        </div>

        <div className="my-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sunrise className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Sunrise</span>
                <span className="text-sm sm:text-base font-bold text-white">
                  {today?.sunrise ? formatTimeShort(today.sunrise) : 'N/A'}
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-400">Dawn</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Sunset className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Sunset</span>
                <span className="text-sm sm:text-base font-bold text-white">
                  {today?.sunset ? formatTimeShort(today.sunset) : 'N/A'}
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-400">Dusk</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 border-t border-slate-700/50 pt-2.5">
          {current.isDay ? 'Currently daylight hours' : 'Night period'}
        </p>
      </div>

      {/* 2. UV Radiation Index */}
      <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700/60 shadow-lg backdrop-blur-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-400" />
            UV Exposure
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] border font-bold ${uvInfo.bgColor}`}>
            {uvInfo.label}
          </span>
        </div>

        <div className="my-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-display">
              {current.uvIndex}
            </span>
            <span className="text-xs text-slate-400">of 12 (Max today: {today?.uvIndexMax ?? current.uvIndex})</span>
          </div>

          {/* UV Scale Bar */}
          <div className="mt-3 w-full h-2 bg-slate-700 rounded-full overflow-hidden flex">
            <div className="h-full bg-emerald-400" style={{ width: '20%' }} />
            <div className="h-full bg-amber-400" style={{ width: '25%' }} />
            <div className="h-full bg-orange-400" style={{ width: '20%' }} />
            <div className="h-full bg-rose-400" style={{ width: '20%' }} />
            <div className="h-full bg-purple-500" style={{ width: '15%' }} />
          </div>
        </div>

        <p className="text-xs text-slate-300 border-t border-slate-700/50 pt-2.5 leading-relaxed">
          {uvInfo.description}
        </p>
      </div>

      {/* 3. Wind & Aerodynamics */}
      <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700/60 shadow-lg backdrop-blur-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-teal-400" />
            Wind Conditions
          </span>
          <span>{getWindDirection(current.windDirection)}</span>
        </div>

        <div className="my-3 flex items-center justify-between">
          <div>
            <div className="text-3xl font-extrabold text-white font-display">
              {formatWindSpeed(current.windSpeed, windUnit)}
            </div>
            <span className="text-xs text-slate-400">
              Gusts up to {formatWindSpeed(current.windGusts, windUnit)}
            </span>
          </div>

          {/* Compass Rose dial */}
          <div className="relative w-12 h-12 rounded-full border border-slate-600/70 bg-slate-900/80 flex items-center justify-center shrink-0">
            <div
              className="w-1.5 h-6 bg-teal-400 rounded-full transition-transform duration-500 shadow-sm shadow-teal-400/50"
              style={{ transform: `rotate(${current.windDirection}deg)` }}
            />
            <span className="absolute -top-1.5 text-[9px] font-bold text-slate-400">N</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 border-t border-slate-700/50 pt-2.5">
          {current.windSpeed < 10
            ? 'Light breeze, calm conditions'
            : current.windSpeed < 30
            ? 'Moderate wind, noticeable outdoors'
            : 'Strong windy conditions, secure loose items'}
        </p>
      </div>

      {/* 4. Moisture & Atmospheric Pressure */}
      <div className="bg-slate-800/80 rounded-3xl p-5 border border-slate-700/60 shadow-lg backdrop-blur-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-indigo-400" />
            Atmosphere & Dew
          </span>
          <span>Barometer</span>
        </div>

        <div className="my-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Dew Point</span>
            <span className="text-sm font-bold text-white">
              {formatTemperature(dewPoint, unit)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Air Pressure</span>
            <span className="text-sm font-bold text-white">
              {Math.round(current.pressure)} hPa
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Daily Rain Total</span>
            <span className="text-sm font-bold text-white">
              {today?.precipitationSum ?? current.precipitation} mm
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 border-t border-slate-700/50 pt-2.5">
          {current.pressure > 1015
            ? 'High pressure indicates stable, fair weather'
            : 'Low pressure may bring unsettled weather'}
        </p>
      </div>

    </div>
  );
};
