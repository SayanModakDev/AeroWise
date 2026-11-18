export interface CpcbCategory {
  category: string;
  aqiRange: string;
  pm25_24h_range: string; // µg/m³
  pm10_24h_range: string; // µg/m³
  healthAdvisory: string;
  color: string;
  bgClass: string;
}

export const CPCB_NAQI_CATEGORIES: CpcbCategory[] = [
  {
    category: 'Good',
    aqiRange: '0 – 50',
    pm25_24h_range: '0 – 30',
    pm10_24h_range: '0 – 50',
    healthAdvisory: 'Minimal health impact.',
    color: '#16a34a',
    bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    category: 'Satisfactory',
    aqiRange: '51 – 100',
    pm25_24h_range: '31 – 60',
    pm10_24h_range: '51 – 100',
    healthAdvisory: 'Minor breathing discomfort to sensitive people.',
    color: '#65a30d',
    bgClass: 'bg-lime-50 text-lime-800 border-lime-200',
  },
  {
    category: 'Moderate',
    aqiRange: '101 – 200',
    pm25_24h_range: '61 – 90',
    pm10_24h_range: '101 – 250',
    healthAdvisory: 'Breathing discomfort to the people with lungs, asthma and heart diseases.',
    color: '#d97706',
    bgClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    category: 'Poor',
    aqiRange: '201 – 300',
    pm25_24h_range: '91 – 120',
    pm10_24h_range: '251 – 350',
    healthAdvisory: 'Breathing discomfort to most people on prolonged exposure.',
    color: '#ea580c',
    bgClass: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  {
    category: 'Very Poor',
    aqiRange: '301 – 400',
    pm25_24h_range: '121 – 250',
    pm10_24h_range: '351 – 430',
    healthAdvisory: 'Respiratory illness on prolonged exposure.',
    color: '#dc2626',
    bgClass: 'bg-red-50 text-red-800 border-red-200',
  },
  {
    category: 'Severe',
    aqiRange: '401 – 500',
    pm25_24h_range: '250+',
    pm10_24h_range: '430+',
    healthAdvisory: 'Affects healthy people and seriously impacts those with existing diseases.',
    color: '#7f1d1d',
    bgClass: 'bg-rose-950 text-rose-100 border-rose-900',
  },
];

export const CPCB_OFFICIAL_PORTAL_URL = 'https://app.cpcbccr.com/AQI_India/';
export const CPCB_WEBSITE_URL = 'https://cpcb.nic.in/';

export const CPCB_REGULATORY_DISCLAIMER =
  'Notice: Modelled forecast concentrations shown in AeroWise are derived from atmospheric numerical models (CAMS Global, ~45 km resolution) and are NOT equivalent to validated regulatory monitoring-station measurements. In India, official National AQI values are published exclusively by the Central Pollution Control Board (CPCB) and State Pollution Control Boards based on multi-pollutant 24-hour statutory monitoring. Always consult the official CPCB portal for statutory alerts and regulatory actions.';

/**
 * Validates whether statutory CPCB AQI criteria are met.
 * Under official CPCB guidelines:
 * 1. At least 3 pollutants must be monitored.
 * 2. One must be either PM10 or PM2.5.
 * 3. A minimum 16 hours of validated data in a 24-hour window is required.
 * Any single-pollutant calculation is invalid under CPCB standards.
 */
export function canCalculateOfficialCpcbAqi(params: {
  pollutantCount: number;
  hasPm25OrPm10: boolean;
  validMonitoredHours: number;
  isOfficialStation: boolean;
}): { allowed: boolean; reason: string } {
  if (!params.isOfficialStation) {
    return {
      allowed: false,
      reason:
        'Modelled forecast data cannot be used to generate official CPCB National AQI. Only validated government station data is statutory.',
    };
  }

  if (params.pollutantCount < 3) {
    return {
      allowed: false,
      reason:
        'CPCB National AQI requires monitoring of at least 3 pollutants. Single or dual pollutant estimates do not qualify.',
    };
  }

  if (!params.hasPm25OrPm10) {
    return {
      allowed: false,
      reason: 'CPCB requires either PM10 or PM2.5 as a mandatory constituent pollutant.',
    };
  }

  if (params.validMonitoredHours < 16) {
    return {
      allowed: false,
      reason:
        'CPCB data completeness requirement specifies at least 16 hours of continuous monitoring for a 24-hour AQI value.',
    };
  }

  return { allowed: true, reason: 'Statutory criteria met.' };
}
