export type CookingFuel =
  | 'lpg'
  | 'electric'
  | 'biomass_wood_coal'
  | 'kerosene'
  | 'other';

export type CookingVentilation =
  | 'chimney_exhaust'
  | 'exhaust_fan'
  | 'window_only'
  | 'poor_none';

export type GeneralVentilation = 'good_cross' | 'moderate' | 'poor';

export type DailyRoutine =
  | 'office_commute'
  | 'school_commute'
  | 'outdoor_worker'
  | 'work_from_home'
  | 'regular_errands';

export type PrimaryTransport =
  | 'walking'
  | 'bicycle'
  | 'motorcycle'
  | 'private_car'
  | 'bus'
  | 'metro_rail'
  | 'carpooling';

export type BudgetTier = 'no_additional_budget' | 'low_budget' | 'flexible_budget';

export interface HouseholdProfile {
  // Composition
  hasYoungChildren: boolean; // Under five
  hasOlderAdults: boolean; // Senior citizens
  hasPregnantMember: boolean;
  hasRespiratoryCardioVulnerability: boolean;

  // Home Environment
  cookingFuel: CookingFuel;
  usesIncenseOrMosquitoCoils: boolean;
  hasIndoorSmoking: boolean;
  cookingVentilation: CookingVentilation;
  generalVentilation: GeneralVentilation;
  hasAirPurifier: boolean;
  hasAcWithRecirculation: boolean;

  // Daily Lifestyle
  primaryRoutine: DailyRoutine;
  frequentOutdoorExercise: boolean;
  dailyOutdoorHours: number; // 0 to 16

  // Transport
  primaryTransport: PrimaryTransport;

  // Practical Constraints
  budgetTier: BudgetTier;
  limitedPublicTransportAccess: boolean;
  limitedTimingFlexibility: boolean;
}

export const DEFAULT_HOUSEHOLD_PROFILE: HouseholdProfile = {
  hasYoungChildren: false,
  hasOlderAdults: false,
  hasPregnantMember: false,
  hasRespiratoryCardioVulnerability: false,

  cookingFuel: 'lpg',
  usesIncenseOrMosquitoCoils: false,
  hasIndoorSmoking: false,
  cookingVentilation: 'exhaust_fan',
  generalVentilation: 'moderate',
  hasAirPurifier: false,
  hasAcWithRecirculation: false,

  primaryRoutine: 'office_commute',
  frequentOutdoorExercise: false,
  dailyOutdoorHours: 2,

  primaryTransport: 'metro_rail',

  budgetTier: 'low_budget',
  limitedPublicTransportAccess: false,
  limitedTimingFlexibility: false,
};
