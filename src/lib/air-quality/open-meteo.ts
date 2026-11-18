import {
  GeoLocation,
  HourlyForecastPoint,
  ModelledAirQuality,
} from '@/types/air-quality';
import { compareWithWhoGuidelines } from './who-guidelines';

export const POPULAR_CITIES: GeoLocation[] = [
  {
    id: 1273294,
    name: 'New Delhi',
    country: 'India',
    countryCode: 'IN',
    admin1: 'Delhi',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 1275339,
    name: 'Mumbai',
    country: 'India',
    countryCode: 'IN',
    admin1: 'Maharashtra',
    latitude: 19.076,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 1277333,
    name: 'Bengaluru',
    country: 'India',
    countryCode: 'IN',
    admin1: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 1275004,
    name: 'Kolkata',
    country: 'India',
    countryCode: 'IN',
    admin1: 'West Bengal',
    latitude: 22.5726,
    longitude: 88.3639,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 1269843,
    name: 'Hyderabad',
    country: 'India',
    countryCode: 'IN',
    admin1: 'Telangana',
    latitude: 17.385,
    longitude: 78.4867,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 1264527,
    name: 'Chennai',
    country: 'India',
    countryCode: 'IN',
    admin1: 'Tamil Nadu',
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: 'Asia/Kolkata',
  },
];

interface CacheEntry {
  timestamp: number;
  data: ModelledAirQuality;
}

// In-memory cache with 15-minute TTL
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)}_${lon.toFixed(2)}`;
}

export async function searchCities(query: string): Promise<GeoLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    name: trimmed,
    count: '10',
    language: 'en',
    format: 'json',
  });

  const url = `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Geocoding API responded with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) {
      return [];
    }

    return data.results.map((item: {
      id: number;
      name: string;
      latitude: number;
      longitude: number;
      country: string;
      country_code?: string;
      admin1?: string;
      timezone?: string;
    }) => ({
      id: item.id,
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country || 'Unknown',
      countryCode: item.country_code?.toUpperCase() || '',
      admin1: item.admin1,
      timezone: item.timezone || 'auto',
    }));
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('City search request timed out. Please check your connection.');
    }
    throw err;
  }
}

export async function fetchAirQuality(
  location: GeoLocation,
  forceRefresh = false
): Promise<ModelledAirQuality> {
  const cacheKey = getCacheKey(location.latitude, location.longitude);
  const now = Date.now();

  if (!forceRefresh) {
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: 'pm2_5,pm10',
    hourly: 'pm2_5,pm10',
    forecast_days: '3',
    timezone: location.timezone || 'auto',
  });

  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Air Quality API responded with status ${response.status}`);
    }

    const raw = await response.json();
    const parsed = parseAirQualityResponse(raw, location);

    // Save to cache
    cache.set(cacheKey, { timestamp: now, data: parsed });

    return parsed;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Air quality data request timed out. Please retry.');
    }
    throw err;
  }
}

export function parseAirQualityResponse(
  raw: {
    current?: { time?: string; pm2_5?: number | null; pm10?: number | null };
    hourly?: {
      time?: string[];
      pm2_5?: (number | null)[];
      pm10?: (number | null)[];
    };
  },
  location: GeoLocation
): ModelledAirQuality {
  const retrievalTimestamp = new Date().toISOString();

  // Validate current readings
  const rawPm25 = raw.current?.pm2_5;
  const rawPm10 = raw.current?.pm10;

  // Never silently replace missing readings with zero
  const currentPm25 = typeof rawPm25 === 'number' && !isNaN(rawPm25) ? rawPm25 : null;
  const currentPm10 = typeof rawPm10 === 'number' && !isNaN(rawPm10) ? rawPm10 : null;
  const dataTimestamp = raw.current?.time || retrievalTimestamp;

  // Parse hourly series
  const hourlyTimes = raw.hourly?.time || [];
  const hourlyPm25 = raw.hourly?.pm2_5 || [];
  const hourlyPm10 = raw.hourly?.pm10 || [];

  const hourly: HourlyForecastPoint[] = [];
  const maxLen = Math.min(hourlyTimes.length, hourlyPm25.length, hourlyPm10.length);

  for (let i = 0; i < maxLen; i++) {
    const p25 = typeof hourlyPm25[i] === 'number' && !isNaN(hourlyPm25[i]!) ? hourlyPm25[i]! : null;
    const p10 = typeof hourlyPm10[i] === 'number' && !isNaN(hourlyPm10[i]!) ? hourlyPm10[i]! : null;
    hourly.push({
      time: hourlyTimes[i],
      pm2_5: p25,
      pm10: p10,
    });
  }

  // Calculate 24h modelled mean only when adequate observations (>= 18 valid hours) are available
  const next24h = hourly.slice(0, 24);
  const valid24hPm25 = next24h
    .map((h) => h.pm2_5)
    .filter((v): v is number => v !== null && !isNaN(v));
  const valid24hPm10 = next24h
    .map((h) => h.pm10)
    .filter((v): v is number => v !== null && !isNaN(v));

  const observationCount = valid24hPm25.length;
  const adequateObservations = observationCount >= 18;

  const meanPm25 =
    adequateObservations && valid24hPm25.length > 0
      ? Number(
          (
            valid24hPm25.reduce((sum, v) => sum + v, 0) / valid24hPm25.length
          ).toFixed(1)
        )
      : null;

  const meanPm10 =
    adequateObservations && valid24hPm10.length > 0
      ? Number(
          (
            valid24hPm10.reduce((sum, v) => sum + v, 0) / valid24hPm10.length
          ).toFixed(1)
        )
      : null;

  // Calculate trend from hourly curve (comparing first 6h vs next 6h, or current vs 6h ago)
  let trendDirection: 'rising' | 'falling' | 'stable' | 'unknown' = 'unknown';
  let changeRate = 0;
  let trendDescription = 'Insufficient hourly forecast points to establish trend.';
  let peakHour: string | undefined;
  let troughHour: string | undefined;

  if (next24h.length >= 12) {
    let minVal = Infinity;
    let maxVal = -Infinity;

    for (const pt of next24h) {
      if (pt.pm2_5 !== null) {
        if (pt.pm2_5 < minVal) {
          minVal = pt.pm2_5;
          troughHour = pt.time;
        }
        if (pt.pm2_5 > maxVal) {
          maxVal = pt.pm2_5;
          peakHour = pt.time;
        }
      }
    }

    const first6 = next24h.slice(0, 6).map((h) => h.pm2_5).filter((v): v is number => v !== null);
    const next6 = next24h.slice(6, 12).map((h) => h.pm2_5).filter((v): v is number => v !== null);

    if (first6.length > 0 && next6.length > 0) {
      const avg1 = first6.reduce((a, b) => a + b, 0) / first6.length;
      const avg2 = next6.reduce((a, b) => a + b, 0) / next6.length;

      if (avg1 > 0) {
        changeRate = Number((((avg2 - avg1) / avg1) * 100).toFixed(1));
        if (changeRate > 12) {
          trendDirection = 'rising';
          trendDescription = `Concentrations projected to rise by ~${changeRate}% over the next 6–12 hours.`;
        } else if (changeRate < -12) {
          trendDirection = 'falling';
          trendDescription = `Concentrations projected to ease by ~${Math.abs(changeRate)}% over the next 6–12 hours.`;
        } else {
          trendDirection = 'stable';
          trendDescription = 'Concentrations projected to remain relatively steady over the next 12 hours.';
        }
      }
    }
  }

  const whoComparison = compareWithWhoGuidelines(
    currentPm25 ?? meanPm25,
    currentPm10 ?? meanPm10
  );

  return {
    location,
    current: {
      pm2_5: currentPm25,
      pm10: currentPm10,
      dataTimestamp,
    },
    retrievalTimestamp,
    modelInfo: {
      name: 'CAMS Global Atmospheric Forecast',
      spatialResolution: '~45 km grid cell',
      temporalResolution: '3-hourly assimilation, 1-hourly output',
      provider: 'European Centre for Medium-Range Weather Forecasts (ECMWF)',
      attribution:
        'Contains modified Copernicus Atmosphere Monitoring Service information 2026. Data delivered via Open-Meteo Air Quality API.',
    },
    hourly,
    daily24hMean: {
      pm2_5: meanPm25,
      pm10: meanPm10,
      observationCount,
      adequateObservations,
    },
    trend: {
      direction: trendDirection,
      changeRate,
      description: trendDescription,
      peakHour,
      troughHour,
    },
    whoComparison,
  };
}
