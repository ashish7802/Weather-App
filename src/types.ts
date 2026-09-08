export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph';

export interface LocationInfo {
  name: string;
  region?: string;
  country: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  isCurrentLocation?: boolean;
}

export interface CurrentWeather {
  time: string;
  temperature: number; // in Celsius
  apparentTemperature: number; // in Celsius
  relativeHumidity: number; // %
  isDay: boolean;
  weatherCode: number;
  precipitation: number; // mm
  windSpeed: number; // km/h
  windDirection: number; // degrees
  windGusts: number; // km/h
  pressure: number; // hPa
  uvIndex: number;
  cloudCover: number; // %
}

export interface HourlyForecastItem {
  time: string; // ISO string
  temperature: number; // Celsius
  weatherCode: number;
  precipitationProbability: number; // %
  relativeHumidity: number; // %
  windSpeed: number; // km/h
  isDay: boolean;
}

export interface DailyForecastItem {
  date: string; // YYYY-MM-DD
  weatherCode: number;
  maxTemp: number; // Celsius
  minTemp: number; // Celsius
  precipitationSum: number; // mm
  precipitationProbability: number; // %
  sunrise: string; // ISO string
  sunset: string; // ISO string
  uvIndexMax: number;
  windSpeedMax: number; // km/h
}

export interface WeatherData {
  location: LocationInfo;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  lastUpdated: string;
}

export interface SearchResultItem {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country: string;
  country_code: string;
  admin1?: string; // state/region
  admin2?: string;
  timezone?: string;
}
