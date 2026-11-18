import { describe, it, expect } from 'vitest';
import { evaluateRecommendations } from '@/lib/decision-engine/engine';
import { DEFAULT_HOUSEHOLD_PROFILE, HouseholdProfile } from '@/types/household';
import { parseAirQualityResponse } from '@/lib/air-quality/open-meteo';
import { GeoLocation } from '@/types/air-quality';
import { ACTION_CATALOG } from '@/lib/recommendations/catalog';

const testLocation: GeoLocation = {
  id: 1,
  name: 'Test Urban Hub',
  country: 'India',
  countryCode: 'IN',
  latitude: 28.6,
  longitude: 77.2,
};

function createMockEnv(pm25: number | null, pm10: number | null) {
  const times: string[] = [];
  const pm25s: (number | null)[] = [];
  const pm10s: (number | null)[] = [];
  for (let i = 0; i < 24; i++) {
    times.push(`2026-11-18T${String(i).padStart(2, '0')}:00:00Z`);
    pm25s.push(pm25);
    pm10s.push(pm10);
  }

  return parseAirQualityResponse(
    {
      current: { time: '2026-11-18T08:00:00Z', pm2_5: pm25, pm10: pm10 },
      hourly: { time: times, pm2_5: pm25s, pm10: pm10s },
    },
    testLocation
  );
}

describe('Air-to-Action Decision Engine Rules', () => {
  it('RULE 1: Vulnerable household prioritization elevates child/elderly protection to Critical priority', () => {
    const envSevere = createMockEnv(280, 410); // Severe smog
    const vulnerableProfile: HouseholdProfile = {
      ...DEFAULT_HOUSEHOLD_PROFILE,
      hasYoungChildren: true,
      hasOlderAdults: true,
      hasRespiratoryCardioVulnerability: true,
    };

    const result = evaluateRecommendations(envSevere, vulnerableProfile);
    const vulnAction = result.allRecommendations.find(
      (a) => a.id === 'vulnerable_exposure_restriction'
    );

    expect(vulnAction).toBeDefined();
    expect(vulnAction?.priority).toBe('critical');
    expect(vulnAction?.applicableHouseholdContext.join(', ')).toContain('child under 5');
    expect(result.topThreeActions.some((a) => a.id === 'vulnerable_exposure_restriction')).toBe(true);
  });

  it('RULE 2: Replaces outdoor workouts with indoor exercise during severe pollution and does not label outdoor air as safe', () => {
    const envSevere = createMockEnv(180, 260);
    const runnerProfile: HouseholdProfile = {
      ...DEFAULT_HOUSEHOLD_PROFILE,
      frequentOutdoorExercise: true,
    };

    const result = evaluateRecommendations(envSevere, runnerProfile);
    const exerciseAction = result.allRecommendations.find(
      (a) => a.id === 'indoor_exercise_substitution'
    );

    expect(exerciseAction).toBeDefined();
    expect(exerciseAction?.priority).toBe('critical');
    expect(exerciseAction?.whatToDo).toContain('indoor');
    expect(exerciseAction?.whyRelevantNow).not.toContain('safe air');
  });

  it('RULE 3: Detects biomass cooking and assigns top critical priority for source mitigation', () => {
    const env = createMockEnv(90, 150);
    const biomassProfile: HouseholdProfile = {
      ...DEFAULT_HOUSEHOLD_PROFILE,
      cookingFuel: 'biomass_wood_coal',
      cookingVentilation: 'poor_none',
    };

    const result = evaluateRecommendations(env, biomassProfile);
    const biomassAction = result.allRecommendations.find(
      (a) => a.id === 'biomass_fuel_transition'
    );

    expect(biomassAction).toBeDefined();
    expect(biomassAction?.priority).toBe('critical');
    expect(result.topThreeActions.some((a) => a.id === 'biomass_fuel_transition')).toBe(true);
  });

  it('RULE 3: Eliminates indoor incense and coils with free alternative guidance', () => {
    const env = createMockEnv(50, 90);
    const incenseProfile: HouseholdProfile = {
      ...DEFAULT_HOUSEHOLD_PROFILE,
      usesIncenseOrMosquitoCoils: true,
    };

    const result = evaluateRecommendations(env, incenseProfile);
    const incenseAction = result.allRecommendations.find(
      (a) => a.id === 'eliminate_incense_mosquito_coils'
    );

    expect(incenseAction).toBeDefined();
    expect(incenseAction?.costTier).toBe('free');
    expect(incenseAction?.priority).toBe('critical');
  });

  it('RULE 4: Suggests N95 respirator and visor mitigation for motorcycle commuters in heavy smog', () => {
    const env = createMockEnv(160, 240);
    const bikerProfile: HouseholdProfile = {
      ...DEFAULT_HOUSEHOLD_PROFILE,
      primaryTransport: 'motorcycle',
    };

    const result = evaluateRecommendations(env, bikerProfile);
    const bikerAction = result.allRecommendations.find(
      (a) => a.id === 'two_wheeler_commute_mitigation'
    );

    expect(bikerAction).toBeDefined();
    expect(bikerAction?.priority).toBe('critical');
  });

  it('RULE 5: Zero-budget constraints strictly favor 100% free actions', () => {
    const env = createMockEnv(140, 220);
    const zeroBudgetProfile: HouseholdProfile = {
      ...DEFAULT_HOUSEHOLD_PROFILE,
      budgetTier: 'no_additional_budget',
      hasAirPurifier: false,
    };

    const result = evaluateRecommendations(env, zeroBudgetProfile);

    for (const topAction of result.topThreeActions) {
      expect(topAction.costTier).toBe('free');
    }
  });

  it('RULE 7: Explicitly separates exposure-protection impact from emissions-reduction impact', () => {
    const env = createMockEnv(120, 190);
    const result = evaluateRecommendations(env, DEFAULT_HOUSEHOLD_PROFILE);

    for (const action of result.allRecommendations) {
      expect(action.exposureProtectionImpact).toBeDefined();
      expect(action.exposureProtectionImpact.length).toBeGreaterThan(10);
      expect(action.emissionsReductionImpact).toBeDefined();
      expect(action.emissionsReductionImpact.length).toBeGreaterThan(10);
      expect(action.exposureProtectionImpact).not.toContain('% disease prevention');
      expect(action.emissionsReductionImpact).not.toContain('exact kg CO2 guaranteed');
    }
  });

  it('gracefully handles missing / null pollutant readings without throwing runtime exceptions', () => {
    const envNull = createMockEnv(null, null);
    const result = evaluateRecommendations(envNull, DEFAULT_HOUSEHOLD_PROFILE);

    expect(result.allRecommendations.length).toBeGreaterThan(0);
    expect(result.topThreeActions.length).toBe(3);
    expect(result.summary.totalCount).toBeGreaterThan(0);
  });

  it('recognizes inflexible commute timing constraints and flags them in context tags', () => {
    const env = createMockEnv(130, 200);
    const inflexibleProfile: HouseholdProfile = {
      ...DEFAULT_HOUSEHOLD_PROFILE,
      limitedTimingFlexibility: true,
    };

    const result = evaluateRecommendations(env, inflexibleProfile);
    const rescheduleAction = result.allRecommendations.find(
      (a) => a.id === 'reschedule_outdoor_errands'
    );

    expect(rescheduleAction?.applicableHouseholdContext).toContain('Fixed timing constraint noted');
  });

  it('verifies all actions in the catalog contain evidence sources and limitations', () => {
    for (const def of ACTION_CATALOG) {
      expect(def.evidenceSource).toBeDefined();
      expect(def.evidenceSource.length).toBeGreaterThan(5);
      expect(def.limitations).toBeDefined();
      expect(def.limitations.length).toBeGreaterThan(5);
    }
  });
});
