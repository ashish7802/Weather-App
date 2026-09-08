import React from 'react';
import {
  MapPin,
  Compass,
  Droplets,
  Wind,
  Sun,
  Gauge,
  Cloud,
  Umbrella,
  ArrowUp,
  ArrowDown,
  Clock,
} from 'lucide-react';
import { TemperatureUnit, WeatherData, WindSpeedUnit } from '../types';
import {
  formatTemperature,
  formatWindSpeed,
  getUvIndexInfo,
  getWeatherCondition,
  getWindDirection,
} from '../utils/weatherUtils';

interface CurrentWeatherProps {
  data: WeatherData;
  unit: TemperatureUnit;
  windUnit: WindSpeedUnit;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherProps> = ({
  data,
  unit,
  windUnit,
}) => {
  const { location, current, daily } = data;
  const condition = getWeatherCondition(current.weatherCode, current.isDay);
  const IconComponent = condition.icon;
  const uvInfo = getUvIndexInfo(current.uvIndex);
  const todayDaily = daily[0];

  return (
    <div
      id="current-weather-card"
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${condition.gradient} border border-slate-700/60 p-6 sm:p-8 shadow-xl backdrop-blur-sm transition-all`}
    >
      {/* Background atmospheric glow */}
      <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sky-400">
            {location.isCurrentLocation ? (
              <Compass className="w-5 h-5 animate-pulse text-emerald-400" />
            ) : (
              <MapPin className="w-5 h-5 text-sky-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
                {location.name}
              </h2>
              {location.countryCode && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700">
                  {location.countryCode}
                </span>
              )}
              {location.isCurrentLocation && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  GPS Location
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400">
              {location.region ? `${location.region}, ` : ''}{location.country}
            </p>
          </div>
        </div>

        {/* Condition pill & local time */}
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${condition.badgeBg}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
            {condition.label}
          </span>
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/60">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {data.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Main Temperature & Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 mb-8">
        
        {/* Big Temperature Hero */}
        <div className="lg:col-span-7 flex items-center gap-6 sm:gap-8">
          <div className="relative">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/40 shadow-inner">
              <IconComponent className={`w-16 h-16 sm:w-20 sm:h-20 ${condition.iconColor} drop-shadow-md`} />
            </div>
          </div>
          
          <div>
            <div className="flex items-baseline">
              <span className="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter font-display">
                {formatTemperature(current.temperature, unit)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-300">
              <span>
                Feels like{' '}
                <strong className="text-white font-semibold">
                  {formatTemperature(current.apparentTemperature, unit)}
                </strong>
              </span>

              {todayDaily && (
                <div className="flex items-center gap-2 text-xs bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
                  <span className="flex items-center text-rose-400 font-medium">
                    <ArrowUp className="w-3 h-3 mr-0.5" />
                    {formatTemperature(todayDaily.maxTemp, unit)}
                  </span>
                  <span className="text-slate-600">|</span>
                  <span className="flex items-center text-sky-400 font-medium">
                    <ArrowDown className="w-3 h-3 mr-0.5" />
                    {formatTemperature(todayDaily.minTemp, unit)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Narrative Condition Box */}
        <div className="lg:col-span-5 bg-slate-800/60 rounded-2xl p-4 sm:p-5 border border-slate-700/60 flex flex-col justify-between h-full">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Weather Summary
            </h3>
            <p className="text-sm font-medium text-slate-200 leading-relaxed">
              {condition.description}.
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
            <span>UV Index: <strong className={uvInfo.color}>{current.uvIndex} ({uvInfo.label})</strong></span>
            <span>Precipitation: <strong className="text-slate-200">{current.precipitation} mm</strong></span>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 relative z-10">
        
        {/* Humidity */}
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 hover:bg-slate-800 transition">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            <span>Humidity</span>
          </div>
          <div className="text-lg font-bold text-white">
            {current.relativeHumidity}%
          </div>
          <div className="text-[11px] text-slate-400">
            {current.relativeHumidity > 65 ? 'Humid' : current.relativeHumidity < 35 ? 'Dry air' : 'Comfortable'}
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 hover:bg-slate-800 transition">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-400" />
            <span>Wind</span>
          </div>
          <div className="text-lg font-bold text-white">
            {formatWindSpeed(current.windSpeed, windUnit)}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {getWindDirection(current.windDirection)} ({current.windDirection}°)
          </div>
        </div>

        {/* Wind Gusts */}
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 hover:bg-slate-800 transition">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>Wind Gusts</span>
          </div>
          <div className="text-lg font-bold text-white">
            {formatWindSpeed(current.windGusts, windUnit)}
          </div>
          <div className="text-[11px] text-slate-400">
            Peak speed
          </div>
        </div>

        {/* Pressure */}
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 hover:bg-slate-800 transition">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pressure</span>
          </div>
          <div className="text-lg font-bold text-white">
            {Math.round(current.pressure)} <span className="text-xs font-normal text-slate-400">hPa</span>
          </div>
          <div className="text-[11px] text-slate-400">
            {current.pressure >= 1013 ? 'High pressure' : 'Low pressure'}
          </div>
        </div>

        {/* Cloud Cover */}
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 hover:bg-slate-800 transition">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Cloud className="w-3.5 h-3.5 text-slate-400" />
            <span>Cloud Cover</span>
          </div>
          <div className="text-lg font-bold text-white">
            {current.cloudCover}%
          </div>
          <div className="text-[11px] text-slate-400">
            {current.cloudCover > 80 ? 'Overcast' : current.cloudCover > 30 ? 'Partly cloudy' : 'Clear sky'}
          </div>
        </div>

        {/* UV Index */}
        <div className="bg-slate-800/70 rounded-xl p-3 border border-slate-700/50 hover:bg-slate-800 transition">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>UV Index</span>
          </div>
          <div className={`text-lg font-bold ${uvInfo.color}`}>
            {current.uvIndex}
          </div>
          <div className="text-[11px] text-slate-400">
            {uvInfo.label} risk
          </div>
        </div>

      </div>
    </div>
  );
};
