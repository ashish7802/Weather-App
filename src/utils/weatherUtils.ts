import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  CloudMoon,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  LucideIcon,
} from 'lucide-react';
import { TemperatureUnit, WindSpeedUnit } from '../types';

export interface WeatherConditionInfo {
  label: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  gradient: string;
  badgeBg: string;
  accentColor: string;
}

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  if (unit === 'fahrenheit') {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°`;
  }
  return `${Math.round(celsius)}°`;
}

export function formatTemperatureValue(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'fahrenheit') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

export function formatWindSpeed(kmh: number, unit: WindSpeedUnit): string {
  if (unit === 'mph') {
    const mph = kmh * 0.621371;
    return `${Math.round(mph)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
}

export function getUvIndexInfo(uv: number): { label: string; color: string; bgColor: string; description: string } {
  if (uv <= 2) {
    return {
      label: 'Low',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      description: 'Minimal sun protection needed. Safe outdoors.',
    };
  }
  if (uv <= 5) {
    return {
      label: 'Moderate',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      description: 'Wear sun protection and sunglasses around midday.',
    };
  }
  if (uv <= 7) {
    return {
      label: 'High',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      description: 'Protection required: seek shade during midday hours.',
    };
  }
  if (uv <= 10) {
    return {
      label: 'Very High',
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      description: 'Extra precautions needed. Unprotected skin will burn.',
    };
  }
  return {
    label: 'Extreme',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    description: 'Avoid midday sun! Extreme risk of harm from unprotected exposure.',
  };
}

/**
 * WMO Weather interpretation codes (WW)
 */
export function getWeatherCondition(code: number, isDay: boolean = true): WeatherConditionInfo {
  switch (code) {
    case 0:
      return {
        label: isDay ? 'Clear Sky' : 'Clear Night',
        description: isDay ? 'Bright, sunny conditions with clear skies' : 'Crisp, clear skies at night',
        icon: isDay ? Sun : Moon,
        iconColor: isDay ? 'text-amber-400' : 'text-sky-200',
        gradient: isDay ? 'from-amber-500/15 via-orange-500/5 to-slate-900' : 'from-slate-800 via-indigo-950/30 to-slate-900',
        badgeBg: isDay ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        accentColor: isDay ? 'amber' : 'indigo',
      };
    case 1:
      return {
        label: isDay ? 'Mainly Clear' : 'Mostly Clear',
        description: 'Occasional light passing clouds',
        icon: isDay ? CloudSun : CloudMoon,
        iconColor: isDay ? 'text-amber-300' : 'text-slate-300',
        gradient: isDay ? 'from-sky-600/15 via-amber-500/10 to-slate-900' : 'from-slate-800 via-slate-900 to-slate-950',
        badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        accentColor: 'sky',
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        description: 'Scattered clouds with periods of sun',
        icon: isDay ? CloudSun : CloudMoon,
        iconColor: isDay ? 'text-sky-300' : 'text-slate-300',
        gradient: 'from-slate-700/30 via-sky-900/15 to-slate-900',
        badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        accentColor: 'slate',
      };
    case 3:
      return {
        label: 'Overcast',
        description: 'Dense cloud cover across the sky',
        icon: Cloud,
        iconColor: 'text-slate-400',
        gradient: 'from-slate-700/40 via-slate-800/20 to-slate-900',
        badgeBg: 'bg-slate-600/20 text-slate-300 border-slate-500/30',
        accentColor: 'slate',
      };
    case 45:
    case 48:
      return {
        label: code === 48 ? 'Rime Fog' : 'Foggy',
        description: 'Reduced visibility due to dense fog banks',
        icon: CloudFog,
        iconColor: 'text-slate-300',
        gradient: 'from-slate-600/30 via-slate-800/30 to-slate-900',
        badgeBg: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        accentColor: 'slate',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: code === 51 ? 'Light Drizzle' : code === 53 ? 'Moderate Drizzle' : 'Heavy Drizzle',
        description: 'Fine, misty water droplets falling steadily',
        icon: CloudDrizzle,
        iconColor: 'text-cyan-400',
        gradient: 'from-cyan-900/30 via-slate-800/20 to-slate-900',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        accentColor: 'cyan',
      };
    case 56:
    case 57:
      return {
        label: 'Freezing Drizzle',
        description: 'Freezing mist, potential slippery road surfaces',
        icon: CloudDrizzle,
        iconColor: 'text-teal-300',
        gradient: 'from-teal-900/30 via-slate-800/20 to-slate-900',
        badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
        accentColor: 'teal',
      };
    case 61:
    case 63:
    case 65:
      return {
        label: code === 61 ? 'Slight Rain' : code === 63 ? 'Moderate Rain' : 'Heavy Rain',
        description: code === 65 ? 'Heavy continuous rainfall, keep an umbrella handy' : 'Steady rain showers',
        icon: CloudRain,
        iconColor: 'text-blue-400',
        gradient: 'from-blue-900/40 via-indigo-950/20 to-slate-900',
        badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        accentColor: 'blue',
      };
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        description: 'Precipitation freezing upon contact with surfaces',
        icon: CloudRain,
        iconColor: 'text-cyan-300',
        gradient: 'from-cyan-900/40 via-slate-800/20 to-slate-900',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        accentColor: 'cyan',
      };
    case 71:
    case 73:
    case 75:
    case 77:
      return {
        label: code === 71 ? 'Light Snow' : code === 75 ? 'Heavy Snowfall' : 'Moderate Snow',
        description: 'Snow flurries accumulating on surfaces',
        icon: CloudSnow,
        iconColor: 'text-sky-200',
        gradient: 'from-sky-900/30 via-slate-800/20 to-slate-900',
        badgeBg: 'bg-sky-400/20 text-sky-200 border-sky-400/30',
        accentColor: 'sky',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: code === 80 ? 'Light Showers' : code === 82 ? 'Violent Rain Showers' : 'Rain Showers',
        description: 'Scattered intermittent precipitation showers',
        icon: CloudRain,
        iconColor: 'text-blue-400',
        gradient: 'from-blue-900/40 via-slate-900 to-slate-950',
        badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        accentColor: 'blue',
      };
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        description: 'Brief sudden bursts of falling snow',
        icon: CloudSnow,
        iconColor: 'text-sky-200',
        gradient: 'from-sky-900/30 via-slate-800/20 to-slate-900',
        badgeBg: 'bg-sky-400/20 text-sky-200 border-sky-400/30',
        accentColor: 'sky',
      };
    case 95:
      return {
        label: 'Thunderstorm',
        description: 'Lightning, thunder, and gusty winds observed',
        icon: CloudLightning,
        iconColor: 'text-amber-400',
        gradient: 'from-amber-950/40 via-purple-950/30 to-slate-900',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        accentColor: 'amber',
      };
    case 96:
    case 99:
      return {
        label: 'Thunderstorm with Hail',
        description: 'Severe weather with lightning, downpours, and hail',
        icon: CloudLightning,
        iconColor: 'text-rose-400',
        gradient: 'from-rose-950/40 via-purple-950/30 to-slate-900',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        accentColor: 'rose',
      };
    default:
      return {
        label: 'Clear',
        description: 'Fair weather conditions',
        icon: isDay ? Sun : Moon,
        iconColor: 'text-amber-300',
        gradient: 'from-slate-800 via-slate-900 to-slate-950',
        badgeBg: 'bg-slate-700/30 text-slate-300 border-slate-600/30',
        accentColor: 'slate',
      };
  }
}

export function formatDayName(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';

  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export function formatTimeShort(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatHourOnly(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}
