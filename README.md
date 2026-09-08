# ⛅ Weather Forecast

A sleek, responsive, real-time meteorological web application crafted with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**. Fetches accurate weather observations, hourly trends, and 7-day outlooks for any global location or your current GPS position.

---

## ✨ Features

- **📍 GPS & Smart Location Search**
  - Instant one-click geolocation detection with reverse geocoding.
  - Global search with fast auto-complete for cities, regions, and countries.
  - Quick-access buttons for popular world capitals and recent search history.

- **☀️ Real-Time Weather Conditions**
  - Dynamic weather illustrations with day/night variations.
  - Live temperature, apparent "feels-like" temperature, and daily high/low spans.
  - Ambient color gradients tailored to current weather conditions.

- **📊 Comprehensive Atmospheric Metrics**
  - **UV Index**: Color-coded risk scale (Low to Extreme) with skin safety precautions.
  - **Wind & Gusts**: Velocity, peak gusts, and an interactive directional compass rose dial.
  - **Moisture & Atmosphere**: Relative humidity, barometric air pressure, and calculated dew point.
  - **Precipitation**: Rain probabilities and accumulation totals in millimeters.

- **⏱️ 24-Hour Hourly Timeline**
  - Smooth horizontal scrolling timeline showing hourly temperatures, weather status, and rain chance.

- **📅 7-Day Extended Outlook**
  - Multi-day forecasts featuring proportional temperature distribution bars.

- **🌅 Solar Cycle & Smart Advisories**
  - Exact sunrise and sunset times with total daylight hours calculated.
  - Automated safety banners for high UV radiation, incoming rain, strong wind gusts, or near-freezing conditions.

- **⚙️ Customization & Multi-Provider Support**
  - Unit toggles for **Celsius / Fahrenheit** (°C / °F) and **Wind Speed** (km/h / mph).
  - Built-in zero-key high-resolution **Open-Meteo API**.
  - Optional support for custom **OpenWeatherMap** or **WeatherAPI.com** keys.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Bundler & Tooling** | [Vite 6](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Animations** | [Motion](https://motion.dev/) |
| **Typography** | Plus Jakarta Sans & Outfit (Google Fonts) |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/weather-forecast.git
cd weather-forecast
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Configuration & Environment Variables

The app works **out-of-the-box** without any API keys required (using the Open-Meteo meteorological service). If you wish to use a custom provider, create a `.env` file:

```env
# Optional: OpenWeatherMap or WeatherAPI.com key
VITE_WEATHER_API_KEY=""
VITE_OPENWEATHER_API_KEY=""
```

You can also enter or update your API key directly in the app's UI via the **API Key** button in the top navigation.

---

## 📦 Production Build & Deployment

### Build for Production

```bash
npm run build
```

This compiles the static assets into the `dist/` directory.

### Deploy to Vercel

This repository includes a pre-configured `vercel.json` file for immediate deployment:

1. Push your repository to GitHub or GitLab.
2. Import the project into your [Vercel Dashboard](https://vercel.com/new).
3. Vercel will automatically detect the **Vite** preset and run `npm run build`.
4. Click **Deploy**.

---

## 📜 Available Scripts

- `npm run dev` — Starts the Vite development server on port 3000.
- `npm run build` — Compiles TypeScript and builds optimized static assets to `dist/`.
- `npm run preview` — Locally previews the production build.
- `npm run lint` — Validates TypeScript types across the codebase.

---

## 📄 License & Data Attributions

- Weather data powered by [Open-Meteo](https://open-meteo.com/) (Free CC-BY 4.0).
- Geocoding and reverse lookup via [BigDataCloud](https://www.bigdatacloud.com/) and [Open-Meteo Geocoding](https://open-meteo.com/en/docs/geocoding-api).
- Licensed under the [Apache 2.0 License](LICENSE).
