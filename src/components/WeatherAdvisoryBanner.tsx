import React from 'react';
import { AlertTriangle, Info, ShieldCheck, Umbrella, Wind, Flame } from 'lucide-react';
import { TemperatureUnit, WeatherData, WindSpeedUnit } from '../types';
import { formatTemperature, formatWindSpeed } from '../utils/weatherUtils';

interface WeatherAdvisoryBannerProps {
  data: WeatherData;
  unit: TemperatureUnit;
  windUnit: WindSpeedUnit;
}

export const WeatherAdvisoryBanner: React.FC<WeatherAdvisoryBannerProps> = ({
  data,
  unit,
  windUnit,
}) => {
  const { current, daily } = data;
  const today = daily[0];

  const advisories: { icon: any; title: string; text: string; color: string; border: string; bg: string }[] = [];

  // UV Alert
  if (current.uvIndex >= 6 || (today && today.uvIndexMax >= 7)) {
    advisories.push({
      icon: Flame,
      title: 'High UV Radiation',
      text: 'Peak UV index reaches elevated levels today. Wear SPF 30+ sunscreen, sunglasses, and limit direct sun exposure around midday.',
      color: 'text-amber-300',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10',
    });
  }

  // Rain Alert
  if (current.precipitation > 0 || (today && today.precipitationProbability >= 50)) {
    advisories.push({
      icon: Umbrella,
      title: 'Precipitation Expected',
      text: `Chance of rain reaches ${today?.precipitationProbability ?? 60}%. Keep an umbrella or waterproof jacket ready.`,
      color: 'text-sky-300',
      border: 'border-sky-500/30',
      bg: 'bg-sky-500/10',
    });
  }

  // Wind Advisory
  if (current.windGusts >= 35 || current.windSpeed >= 28) {
    advisories.push({
      icon: Wind,
      title: 'Breezy & Gusty Winds',
      text: `Wind gusts recorded up to ${formatWindSpeed(current.windGusts, windUnit)}. Caution advised for cycling or handling lightweight outdoor items.`,
      color: 'text-teal-300',
      border: 'border-teal-500/30',
      bg: 'bg-teal-500/10',
    });
  }

  // Freezing / Cold
  if (current.temperature <= 2) {
    advisories.push({
      icon: AlertTriangle,
      title: 'Near-Freezing Temperatures',
      text: `Current temperature is ${formatTemperature(current.temperature, unit)}. Dress warmly in insulated layers and be cautious of icy patches on walkways.`,
      color: 'text-cyan-300',
      border: 'border-cyan-500/30',
      bg: 'bg-cyan-500/10',
    });
  }

  // If no critical alerts, show pleasant conditions advisory
  if (advisories.length === 0) {
    advisories.push({
      icon: ShieldCheck,
      title: 'Favorable Outdoor Conditions',
      text: `Mild conditions with pleasant humidity (${current.relativeHumidity}%) and calm winds. Ideal for outdoor recreation, walking, and commuting.`,
      color: 'text-emerald-300',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
    });
  }

  return (
    <div className="space-y-2.5">
      {advisories.slice(0, 2).map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className={`flex items-start gap-3 p-4 rounded-2xl border ${item.border} ${item.bg} backdrop-blur-sm transition`}
          >
            <div className={`p-1.5 rounded-lg bg-slate-900/50 ${item.color} shrink-0 mt-0.5`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${item.color}`}>
                {item.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 leading-relaxed">
                {item.text}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
