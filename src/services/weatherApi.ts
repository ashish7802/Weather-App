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

/**
 * Retrieves configured Weather API Key if present
 */
export function getConfiguredApiKey(): string {
  try {
    const saved = localStorage.getItem('weather_app_api_key');
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {
    // ignore
  }

  const metaEnv = (import.meta as any).env || {};
  const envKey =
    metaEnv.VITE_WEATHER_API_KEY ||
    metaEnv.VITE_OPENWEATHER_API_KEY ||
    metaEnv.VITE_WEATHERAPI_KEY ||
    '';

  return envKey ? String(envKey).trim() : '';
}

export function saveConfiguredApiKey(key: string): void {
  try {
    if (!key.trim()) {
      localStorage.removeItem('weather_app_api_key');
    } else {
      localStorage.setItem('weather_app_api_key', key.trim());
    }
  } catch (e) {
    console.warn(e);
  }
}

/**
 * Convert OpenWeatherMap weather ID to WMO weather code
 */
function openWeatherIdToWmoCode(id: number): number {
  if (id >= 200 && id <= 232) return 95; // Thunderstorm
  if (id >= 300 && id <= 321) return 51; // Drizzle
  if (id === 511) return 66; // Freezing rain
  if (id >= 500 && id <= 504) return 63; // Rain
  if (id >= 520 && id <= 531) return 80; // Rain showers
  if (id >= 600 && id <= 622) return 71; // Snow
  if (id >= 701 && id <= 781) return 45; // Fog/Mist
  if (id === 800) return 0; // Clear
  if (id === 801) return 1; // Mainly clear
  if (id === 802) return 2; // Partly cloudy
  if (id >= 803) return 3; // Overcast
  return 0;
}

export async function searchLocations(query: string): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const apiKey = getConfiguredApiKey();

  // If user has an OpenWeatherMap API key, we can try OpenWeather geocoding first
  if (apiKey && apiKey.length === 32) {
    try {
      const owmUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(trimmed)}&limit=6&appid=${apiKey}`;
      const res = await fetch(owmUrl);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item: any, idx: number) => ({
            id: idx + 1,
            name: item.name,
            latitude: item.lat,
            longitude: item.lon,
            country: item.country,
            country_code: item.country,
            admin1: item.state,
          }));
        }
      }
    } catch (e) {
      console.warn('OWM geocoding failed, falling back to Open-Meteo', e);
    }
  }

  // Open-Meteo Geocoding
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

export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ name: string; region?: string; country: string; countryCode?: string }> {
  const apiKey = getConfiguredApiKey();

  // If user has an OpenWeatherMap key, try OWM reverse geocode
  if (apiKey && apiKey.length === 32) {
    try {
      const owmRev = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
      const res = await fetch(owmRev);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return {
            name: data[0].name || 'Current Location',
            region: data[0].state,
            country: data[0].country || 'Unknown',
            countryCode: data[0].country,
          };
        }
      }
    } catch (e) {
      // fallback
    }
  }

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

/**
 * Fetch via OpenWeatherMap API if a 32-char key is provided
 */
async function fetchFromOpenWeatherMap(
  location: LocationInfo,
  apiKey: string
): Promise<WeatherData | null> {
  const { latitude, longitude } = location;

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`),
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      console.warn('OpenWeatherMap API error, falling back to Open-Meteo', currentRes.status, forecastRes.status);
      return null;
    }

    const cur = await currentRes.json();
    const fc = await forecastRes.json();

    const isDay = cur.weather?.[0]?.icon ? cur.weather[0].icon.includes('d') : true;
    const wCode = openWeatherIdToWmoCode(cur.weather?.[0]?.id || 800);

    // Build hourly from 3-hour forecast list
    const hourly: HourlyForecastItem[] = (fc.list || []).slice(0, 8).map((item: any) => ({
      time: item.dt_txt || new Date(item.dt * 1000).toISOString(),
      temperature: item.main.temp ?? 0,
      weatherCode: openWeatherIdToWmoCode(item.weather?.[0]?.id || 800),
      precipitationProbability: Math.round((item.pop || 0) * 100),
      relativeHumidity: item.main.humidity ?? 0,
      windSpeed: Math.round((item.wind?.speed ?? 0) * 3.6),
      isDay: item.sys?.pod ? item.sys.pod === 'd' : true,
    }));

    // Group daily forecast from 3-hour list
    const dailyMap = new Map<string, { min: number; max: number; wCode: number; pops: number[] }>();
    for (const item of (fc.list || [])) {
      const date = (item.dt_txt || '').split(' ')[0] || new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          min: item.main.temp_min,
          max: item.main.temp_max,
          wCode: openWeatherIdToWmoCode(item.weather?.[0]?.id || 800),
          pops: [item.pop || 0],
        });
      } else {
        const existing = dailyMap.get(date)!;
        existing.min = Math.min(existing.min, item.main.temp_min);
        existing.max = Math.max(existing.max, item.main.temp_max);
        existing.pops.push(item.pop || 0);
      }
    }

    const daily: DailyForecastItem[] = Array.from(dailyMap.entries()).slice(0, 7).map(([date, val], idx) => {
      const maxPop = Math.round(Math.max(...val.pops) * 100);
      return {
        date,
        weatherCode: val.wCode,
        maxTemp: val.max,
        minTemp: val.min,
        precipitationSum: 0,
        precipitationProbability: maxPop,
        sunrise: idx === 0 && cur.sys?.sunrise ? new Date(cur.sys.sunrise * 1000).toISOString() : '',
        sunset: idx === 0 && cur.sys?.sunset ? new Date(cur.sys.sunset * 1000).toISOString() : '',
        uvIndexMax: 5,
        windSpeedMax: Math.round((cur.wind?.speed ?? 0) * 3.6),
      };
    });

    return {
      location: {
        ...location,
        name: cur.name || location.name,
        country: cur.sys?.country || location.country,
      },
      current: {
        time: new Date(cur.dt * 1000).toISOString(),
        temperature: cur.main.temp ?? 0,
        apparentTemperature: cur.main.feels_like ?? cur.main.temp ?? 0,
        relativeHumidity: cur.main.humidity ?? 0,
        isDay,
        weatherCode: wCode,
        precipitation: cur.rain?.['1h'] ?? cur.rain?.['3h'] ?? 0,
        windSpeed: Math.round((cur.wind?.speed ?? 0) * 3.6),
        windDirection: cur.wind?.deg ?? 0,
        windGusts: cur.wind?.gust ? Math.round(cur.wind.gust * 3.6) : Math.round((cur.wind?.speed ?? 0) * 3.6),
        pressure: cur.main.pressure ?? 1013,
        uvIndex: 4, // OpenWeather basic endpoint doesn't include UV
        cloudCover: cur.clouds?.all ?? 0,
      },
      hourly,
      daily,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      provider: 'OpenWeatherMap API',
    };
  } catch (err) {
    console.warn('Error fetching from OpenWeatherMap, falling back to Open-Meteo', err);
    return null;
  }
}

/**
 * Fetch via WeatherAPI.com if key is provided
 */
async function fetchFromWeatherApi(
  location: LocationInfo,
  apiKey: string
): Promise<WeatherData | null> {
  const { latitude, longitude } = location;

  try {
    const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=7&aqi=no&alerts=no`);
    if (!res.ok) return null;

    const data = await res.json();
    const cur = data.current;
    const days = data.forecast?.forecastday || [];

    const hourly: HourlyForecastItem[] = [];
    if (days[0]?.hour) {
      for (const h of days[0].hour.slice(0, 24)) {
        hourly.push({
          time: h.time,
          temperature: h.temp_c,
          weatherCode: h.condition?.code > 1000 ? 3 : 0,
          precipitationProbability: h.chance_of_rain ?? 0,
          relativeHumidity: h.humidity ?? 0,
          windSpeed: h.wind_kph ?? 0,
          isDay: Boolean(h.is_day),
        });
      }
    }

    const daily: DailyForecastItem[] = days.map((d: any) => ({
      date: d.date,
      weatherCode: 0,
      maxTemp: d.day?.maxtemp_c ?? 0,
      minTemp: d.day?.mintemp_c ?? 0,
      precipitationSum: d.day?.totalprecip_mm ?? 0,
      precipitationProbability: d.day?.daily_chance_of_rain ?? 0,
      sunrise: d.astro?.sunrise || '',
      sunset: d.astro?.sunset || '',
      uvIndexMax: d.day?.uv ?? 0,
      windSpeedMax: d.day?.maxwind_kph ?? 0,
    }));

    return {
      location: {
        ...location,
        name: data.location?.name || location.name,
        region: data.location?.region || location.region,
        country: data.location?.country || location.country,
      },
      current: {
        time: cur.last_updated || new Date().toISOString(),
        temperature: cur.temp_c ?? 0,
        apparentTemperature: cur.feelslike_c ?? cur.temp_c ?? 0,
        relativeHumidity: cur.humidity ?? 0,
        isDay: Boolean(cur.is_day),
        weatherCode: cur.condition?.code > 1000 ? 3 : 0,
        precipitation: cur.precip_mm ?? 0,
        windSpeed: cur.wind_kph ?? 0,
        windDirection: cur.wind_degree ?? 0,
        windGusts: cur.gust_kph ?? cur.wind_kph ?? 0,
        pressure: cur.pressure_mb ?? 1013,
        uvIndex: cur.uv ?? 0,
        cloudCover: cur.cloud ?? 0,
      },
      hourly,
      daily,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      provider: 'WeatherAPI.com',
    };
  } catch (err) {
    console.warn('Error fetching from WeatherAPI, falling back to Open-Meteo', err);
    return null;
  }
}

/**
 * Standard High-Precision Open-Meteo API (Free, zero API key required)
 */
async function fetchFromOpenMeteo(location: LocationInfo): Promise<WeatherData> {
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

  let startIndex = hourlyTimes.findIndex((t) => t >= currentTimeIso);
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
    provider: 'Open-Meteo API',
  };
}

/**
 * Universal Weather Fetcher
 * Automatically uses Weather API Key (OpenWeatherMap / WeatherAPI) if provided,
 * otherwise falls back cleanly to Open-Meteo.
 */
export async function fetchWeatherData(location: LocationInfo): Promise<WeatherData> {
  const apiKey = getConfiguredApiKey();

  if (apiKey) {
    // Try OpenWeatherMap (standard 32 char hex key)
    if (apiKey.length === 32) {
      const owmData = await fetchFromOpenWeatherMap(location, apiKey);
      if (owmData) return owmData;
    } else {
      // Try WeatherAPI
      const wApiData = await fetchFromWeatherApi(location, apiKey);
      if (wApiData) return wApiData;
    }
  }

  // Default / Fallback
  return fetchFromOpenMeteo(location);
}
