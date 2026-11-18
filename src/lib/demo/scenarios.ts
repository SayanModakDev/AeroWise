import { GeoLocation, ModelledAirQuality } from '@/types/air-quality';
import { HouseholdProfile } from '@/types/household';
import { parseAirQualityResponse } from '../air-quality/open-meteo';

export interface DemoScenario {
  id: string;
  name: string;
  badge: string;
  description: string;
  location: GeoLocation;
  profile: HouseholdProfile;
  airQuality: ModelledAirQuality;
}

function generateSyntheticHourlyData(
  basePm25: number,
  basePm10: number
) {
  const times: string[] = [];
  const pm25s: number[] = [];
  const pm10s: number[] = [];

  const now = new Date();
  now.setMinutes(0, 0, 0);

  for (let i = 0; i < 72; i++) {
    const d = new Date(now.getTime() + i * 3600 * 1000);
    times.push(d.toISOString());

    const hourOfDay = d.getHours();
    // Diurnal variation factor: peaks at morning (07:00-09:00) and late evening (20:00-23:00)
    let diurnalFactor = 1.0;
    if (hourOfDay >= 6 && hourOfDay <= 9) {
      diurnalFactor = 1.35; // morning peak
    } else if (hourOfDay >= 12 && hourOfDay <= 16) {
      diurnalFactor = 0.65; // afternoon trough
    } else if (hourOfDay >= 20 && hourOfDay <= 23) {
      diurnalFactor = 1.25; // evening rush + inversion
    } else {
      diurnalFactor = 0.95;
    }

    // Add mild sinusoidal multi-day cycle
    const dayFactor = 1.0 + 0.1 * Math.sin((i / 24) * Math.PI * 2);

    const val25 = Math.round(basePm25 * diurnalFactor * dayFactor);
    const val10 = Math.round(basePm10 * diurnalFactor * dayFactor);

    pm25s.push(val25);
    pm10s.push(val10);
  }

  return { times, pm25s, pm10s };
}

// 1. ELEVATED WINTER SMOG
const delhiLoc: GeoLocation = {
  id: 1273294,
  name: 'New Delhi (Winter Smog)',
  country: 'India',
  countryCode: 'IN',
  admin1: 'Delhi',
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
};

const delhiHourly = generateSyntheticHourlyData(285, 420);
const delhiAirQuality = parseAirQualityResponse(
  {
    current: {
      time: new Date().toISOString(),
      pm2_5: 295,
      pm10: 435,
    },
    hourly: {
      time: delhiHourly.times,
      pm2_5: delhiHourly.pm25s,
      pm10: delhiHourly.pm10s,
    },
  },
  delhiLoc
);

const delhiProfile: HouseholdProfile = {
  hasYoungChildren: true,
  hasOlderAdults: true,
  hasPregnantMember: false,
  hasRespiratoryCardioVulnerability: true,
  cookingFuel: 'lpg',
  usesIncenseOrMosquitoCoils: false,
  hasIndoorSmoking: false,
  cookingVentilation: 'chimney_exhaust',
  generalVentilation: 'moderate',
  hasAirPurifier: true,
  hasAcWithRecirculation: true,
  primaryRoutine: 'office_commute',
  frequentOutdoorExercise: false,
  dailyOutdoorHours: 1,
  primaryTransport: 'private_car',
  budgetTier: 'flexible_budget',
  limitedPublicTransportAccess: false,
  limitedTimingFlexibility: false,
};

// 2. MODERATE POLLUTION WITH VULNERABLE INFANT & ELDERLY
const mumbaiLoc: GeoLocation = {
  id: 1275339,
  name: 'Mumbai (Coastal Inversion)',
  country: 'India',
  countryCode: 'IN',
  admin1: 'Maharashtra',
  latitude: 19.076,
  longitude: 72.8777,
  timezone: 'Asia/Kolkata',
};

const mumbaiHourly = generateSyntheticHourlyData(68, 115);
const mumbaiAirQuality = parseAirQualityResponse(
  {
    current: {
      time: new Date().toISOString(),
      pm2_5: 68,
      pm10: 115,
    },
    hourly: {
      time: mumbaiHourly.times,
      pm2_5: mumbaiHourly.pm25s,
      pm10: mumbaiHourly.pm10s,
    },
  },
  mumbaiLoc
);

const mumbaiProfile: HouseholdProfile = {
  hasYoungChildren: true, // Infant under five
  hasOlderAdults: true, // Grandparents
  hasPregnantMember: false,
  hasRespiratoryCardioVulnerability: true,
  cookingFuel: 'lpg',
  usesIncenseOrMosquitoCoils: true, // Traditional morning incense
  hasIndoorSmoking: false,
  cookingVentilation: 'exhaust_fan',
  generalVentilation: 'good_cross',
  hasAirPurifier: false,
  hasAcWithRecirculation: false,
  primaryRoutine: 'school_commute',
  frequentOutdoorExercise: false,
  dailyOutdoorHours: 2,
  primaryTransport: 'bus',
  budgetTier: 'low_budget',
  limitedPublicTransportAccess: false,
  limitedTimingFlexibility: true,
};

// 3. OUTDOOR WORKER WITH LONG DAILY EXPOSURE
const kolkataLoc: GeoLocation = {
  id: 1275004,
  name: 'Kolkata (Industrial Corridor)',
  country: 'India',
  countryCode: 'IN',
  admin1: 'West Bengal',
  latitude: 22.5726,
  longitude: 88.3639,
  timezone: 'Asia/Kolkata',
};

const kolkataHourly = generateSyntheticHourlyData(145, 230);
const kolkataAirQuality = parseAirQualityResponse(
  {
    current: {
      time: new Date().toISOString(),
      pm2_5: 145,
      pm10: 230,
    },
    hourly: {
      time: kolkataHourly.times,
      pm2_5: kolkataHourly.pm25s,
      pm10: kolkataHourly.pm10s,
    },
  },
  kolkataLoc
);

const kolkataProfile: HouseholdProfile = {
  hasYoungChildren: false,
  hasOlderAdults: false,
  hasPregnantMember: false,
  hasRespiratoryCardioVulnerability: false,
  cookingFuel: 'lpg',
  usesIncenseOrMosquitoCoils: false,
  hasIndoorSmoking: false,
  cookingVentilation: 'window_only',
  generalVentilation: 'moderate',
  hasAirPurifier: false,
  hasAcWithRecirculation: false,
  primaryRoutine: 'outdoor_worker',
  frequentOutdoorExercise: false,
  dailyOutdoorHours: 9, // Long roadway exposure
  primaryTransport: 'motorcycle',
  budgetTier: 'low_budget',
  limitedPublicTransportAccess: true,
  limitedTimingFlexibility: true,
};

// 4. HOUSEHOLD WITH INDOOR BIOMASS COOKING
const patnaLoc: GeoLocation = {
  id: 1260086,
  name: 'Patna Peri-Urban (Biomass Cookstove)',
  country: 'India',
  countryCode: 'IN',
  admin1: 'Bihar',
  latitude: 25.5941,
  longitude: 85.1376,
  timezone: 'Asia/Kolkata',
};

const patnaHourly = generateSyntheticHourlyData(110, 185);
const patnaAirQuality = parseAirQualityResponse(
  {
    current: {
      time: new Date().toISOString(),
      pm2_5: 110,
      pm10: 185,
    },
    hourly: {
      time: patnaHourly.times,
      pm2_5: patnaHourly.pm25s,
      pm10: patnaHourly.pm10s,
    },
  },
  patnaLoc
);

const patnaProfile: HouseholdProfile = {
  hasYoungChildren: true,
  hasOlderAdults: true,
  hasPregnantMember: true,
  hasRespiratoryCardioVulnerability: true,
  cookingFuel: 'biomass_wood_coal', // Wood/chulha fuel
  usesIncenseOrMosquitoCoils: true, // Mosquito coils used at night
  hasIndoorSmoking: false,
  cookingVentilation: 'poor_none',
  generalVentilation: 'poor',
  hasAirPurifier: false,
  hasAcWithRecirculation: false,
  primaryRoutine: 'regular_errands',
  frequentOutdoorExercise: false,
  dailyOutdoorHours: 4,
  primaryTransport: 'walking',
  budgetTier: 'no_additional_budget',
  limitedPublicTransportAccess: true,
  limitedTimingFlexibility: false,
};

// 5. BUDGET-CONSTRAINED HOUSEHOLD WITHOUT AIR PURIFIER
const bengaluruLoc: GeoLocation = {
  id: 1277333,
  name: 'Bengaluru (Traffic Corridor)',
  country: 'India',
  countryCode: 'IN',
  admin1: 'Karnataka',
  latitude: 12.9716,
  longitude: 77.5946,
  timezone: 'Asia/Kolkata',
};

const bengaluruHourly = generateSyntheticHourlyData(175, 260);
const bengaluruAirQuality = parseAirQualityResponse(
  {
    current: {
      time: new Date().toISOString(),
      pm2_5: 175,
      pm10: 260,
    },
    hourly: {
      time: bengaluruHourly.times,
      pm2_5: bengaluruHourly.pm25s,
      pm10: bengaluruHourly.pm10s,
    },
  },
  bengaluruLoc
);

const bengaluruProfile: HouseholdProfile = {
  hasYoungChildren: false,
  hasOlderAdults: false,
  hasPregnantMember: false,
  hasRespiratoryCardioVulnerability: true, // Adult with allergic asthma
  cookingFuel: 'lpg',
  usesIncenseOrMosquitoCoils: true,
  hasIndoorSmoking: false,
  cookingVentilation: 'window_only',
  generalVentilation: 'moderate',
  hasAirPurifier: false, // Cannot afford purifier
  hasAcWithRecirculation: false,
  primaryRoutine: 'office_commute',
  frequentOutdoorExercise: true, // Avid runner
  dailyOutdoorHours: 3,
  primaryTransport: 'metro_rail',
  budgetTier: 'no_additional_budget',
  limitedPublicTransportAccess: false,
  limitedTimingFlexibility: true,
};

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'winter_smog_delhi',
    name: '1. Severe Winter Smog (Delhi NCR)',
    badge: 'PM2.5: 295 µg/m³ · Critical Inversion',
    description:
      'Severe winter temperature inversion trapping hazardous vehicular and regional particulate matter. High vulnerability household with child and senior.',
    location: delhiLoc,
    profile: delhiProfile,
    airQuality: delhiAirQuality,
  },
  {
    id: 'vulnerable_family_mumbai',
    name: '2. Moderate Inversion & Sensitive Infant',
    badge: 'PM2.5: 68 µg/m³ · Infant & Elderly',
    description:
      'Coastal atmospheric inversion with moderate ambient particulate levels. Household has an infant under 5, elderly grandparents, and morning incense burning.',
    location: mumbaiLoc,
    profile: mumbaiProfile,
    airQuality: mumbaiAirQuality,
  },
  {
    id: 'outdoor_worker_kolkata',
    name: '3. Outdoor Worker & Two-Wheeler Commute',
    badge: 'PM2.5: 145 µg/m³ · 9h Daily Roadway Exposure',
    description:
      'Delivery or field worker spending 9 hours outdoors daily on a motorcycle in an industrial metropolitan corridor. Focus on practical commuter barriers.',
    location: kolkataLoc,
    profile: kolkataProfile,
    airQuality: kolkataAirQuality,
  },
  {
    id: 'biomass_cooking_patna',
    name: '4. Indoor Biomass / Chulha Exposure',
    badge: 'Biomass Cookstove · Zero Extra Budget',
    description:
      'Peri-urban family using solid firewood/dung cooking in an unventilated kitchen with mosquito coil use. Demonstrates critical indoor source elimination.',
    location: patnaLoc,
    profile: patnaProfile,
    airQuality: patnaAirQuality,
  },
  {
    id: 'budget_constrained_bengaluru',
    name: '5. Zero-Budget Runner & No Purifier',
    badge: 'Zero Budget · Asthma · Exercise Rescheduling',
    description:
      'Urban renter with mild asthma who runs outdoors. Cannot afford an air purifier or car. Demonstrates zero-cost indoor mopping, timing shifts, and workout substitution.',
    location: bengaluruLoc,
    profile: bengaluruProfile,
    airQuality: bengaluruAirQuality,
  },
];
