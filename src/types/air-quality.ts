export interface GeoLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  admin1?: string;
  timezone?: string;
}

export interface HourlyForecastPoint {
  time: string; // ISO string or local time string
  pm2_5: number | null;
  pm10: number | null;
}

export interface ModelledAirQuality {
  location: GeoLocation;
  current: {
    pm2_5: number | null;
    pm10: number | null;
    dataTimestamp: string; // Model forecast time
  };
  retrievalTimestamp: string; // Time fetched by application
  modelInfo: {
    name: string;
    spatialResolution: string;
    temporalResolution: string;
    provider: string;
    attribution: string;
  };
  hourly: HourlyForecastPoint[];
  daily24hMean: {
    pm2_5: number | null;
    pm10: number | null;
    observationCount: number;
    adequateObservations: boolean;
  };
  trend: {
    direction: 'rising' | 'falling' | 'stable' | 'unknown';
    changeRate: number; // percentage change over last 6-12 hrs
    description: string;
    peakHour?: string;
    troughHour?: string; // lowest pollution window
  };
  whoComparison: {
    pm25Guideline: number; // 15 µg/m³
    pm10Guideline: number; // 45 µg/m³
    pm25Ratio: number | null;
    pm10Ratio: number | null;
    statusText: string;
  };
}

export interface CpcbReferenceInfo {
  isApplicable: boolean;
  cpcbPortalUrl: string;
  disclaimer: string;
  cpcbBreakpoints: {
    category: string;
    pm25Range: string;
    pm10Range: string;
    healthAdvisory: string;
    color: string;
  }[];
}
