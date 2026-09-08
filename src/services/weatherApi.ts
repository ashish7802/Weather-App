import {
  DailyForecastItem,
  HourlyForecastItem,
  LocationInfo,
  SearchResultItem,
  WeatherData,
} from '../types';

export const POPULAR_LOCATIONS: LocationInfo[] = [
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6895, longitude: 139.6917 },
  { name: 'London', region: 'England', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', region: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.006 },
  { name: 'Paris', region: 'Île-de-France', country: 'France', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Sydney', region: 'New South Wales', country: 'Australia', countryCode: 'AU', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', latitude: 25.2048, longitude: 55.2708 },
];

export async function searchLocations(query: string): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=en&format=json`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoding failed: ${res.statusText}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error('Error searching locations:', err);
    return [];
  }
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<{ name: string; region?: string; country: string; countryCode?: string }> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const name = data.city || data.locality || data.localityInfo?.administrative?.[2]?.name || 'Current Location';
      const region = data.principalSubdivision || data.localityInfo?.administrative?.[1]?.name;
      const country = data.countryName || 'Unknown';
      const countryCode = data.countryCode;
      return { name, region, country, countryCode };
    }
  } catch (err) {
    console.warn('Reverse geocode failed, using coordinates fallback', err);
  }

  return {
    name: 'Current Location',
    country: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
  };
}

export async function fetchWeatherData(location: LocationInfo): Promise<WeatherData> {
  const { latitude, longitude } = location;
  const endpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;

  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`Weather API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const current = data.current;

  // Process hourly (next 24 hours starting from current time index)
  const hourlyTimes: string[] = data.hourly?.time || [];
  const currentTimeIso = current?.time || new Date().toISOString();
  
  // Find index of current hour or closest
  let startIndex = hourlyTimes.findIndex(t => t >= currentTimeIso);
  if (startIndex === -1) startIndex = 0;

  const next24Hours: HourlyForecastItem[] = [];
  const limit = Math.min(startIndex + 24, hourlyTimes.length);
  
  for (let i = startIndex; i < limit; i++) {
    next24Hours.push({
      time: data.hourly.time[i],
      temperature: data.hourly.temperature_2m?.[i] ?? 0,
      weatherCode: data.hourly.weather_code?.[i] ?? 0,
      precipitationProbability: data.hourly.precipitation_probability?.[i] ?? 0,
      relativeHumidity: data.hourly.relative_humidity_2m?.[i] ?? 0,
      windSpeed: data.hourly.wind_speed_10m?.[i] ?? 0,
      isDay: Boolean(data.hourly.is_day?.[i] ?? 1),
    });
  }

  // Process 7-day daily forecast
  const dailyDays: string[] = data.daily?.time || [];
  const daily: DailyForecastItem[] = [];

  for (let i = 0; i < dailyDays.length; i++) {
    daily.push({
      date: dailyDays[i],
      weatherCode: data.daily.weather_code?.[i] ?? 0,
      maxTemp: data.daily.temperature_2m_max?.[i] ?? 0,
      minTemp: data.daily.temperature_2m_min?.[i] ?? 0,
      precipitationSum: data.daily.precipitation_sum?.[i] ?? 0,
      precipitationProbability: data.daily.precipitation_probability_max?.[i] ?? 0,
      sunrise: data.daily.sunrise?.[i] || '',
      sunset: data.daily.sunset?.[i] || '',
      uvIndexMax: data.daily.uv_index_max?.[i] ?? 0,
      windSpeedMax: data.daily.wind_speed_10m_max?.[i] ?? 0,
    });
  }

  return {
    location: {
      ...location,
      timezone: data.timezone,
    },
    current: {
      time: current.time,
      temperature: current.temperature_2m ?? 0,
      apparentTemperature: current.apparent_temperature ?? current.temperature_2m ?? 0,
      relativeHumidity: current.relative_humidity_2m ?? 0,
      isDay: Boolean(current.is_day),
      weatherCode: current.weather_code ?? 0,
      precipitation: current.precipitation ?? 0,
      windSpeed: current.wind_speed_10m ?? 0,
      windDirection: current.wind_direction_10m ?? 0,
      windGusts: current.wind_gusts_10m ?? current.wind_speed_10m ?? 0,
      pressure: current.pressure_msl ?? current.surface_pressure ?? 1013,
      uvIndex: current.uv_index ?? 0,
      cloudCover: current.cloud_cover ?? 0,
    },
    hourly: next24Hours,
    daily,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}
