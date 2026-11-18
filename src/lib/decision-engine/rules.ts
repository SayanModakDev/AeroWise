import { ModelledAirQuality } from '@/types/air-quality';
import { HouseholdProfile } from '@/types/household';
import { ActionPriority } from '@/types/recommendations';
import { ActionDefinition } from '../recommendations/catalog';

export interface EvaluatedActionCandidate {
  definition: ActionDefinition;
  score: number; // Higher is more relevant/urgent
  dynamicPriority: ActionPriority;
  whyRelevantNow: string;
  applicableContext: string[];
}

export function evaluateActionRelevance(
  def: ActionDefinition,
  env: ModelledAirQuality,
  profile: HouseholdProfile
): EvaluatedActionCandidate | null {
  const currentPm25 = env.current.pm2_5 ?? env.daily24hMean.pm2_5 ?? 45;
  const currentPm10 = env.current.pm10 ?? env.daily24hMean.pm10 ?? 90;
  const isSevere = currentPm25 > 150 || currentPm10 > 250;
  const isElevated = currentPm25 > 60 || currentPm10 > 100;

  const hasVulnerable =
    profile.hasYoungChildren ||
    profile.hasOlderAdults ||
    profile.hasPregnantMember ||
    profile.hasRespiratoryCardioVulnerability;

  let baseScore = 50;
  let dynamicPriority: ActionPriority = def.defaultPriority;
  const contextTags: string[] = [];
  let whyRelevantNow = def.whyRelevantNowTemplate;

  // RULE 5: BUDGET SENSITIVITY
  if (profile.budgetTier === 'no_additional_budget') {
    if (def.costTier === 'free') {
      baseScore += 35;
      contextTags.push('Zero-budget priority');
    } else if (def.costTier === 'optional_purchase') {
      baseScore -= 60; // Strongly deprioritize expensive actions
    } else {
      baseScore -= 15;
    }
  } else if (profile.budgetTier === 'low_budget') {
    if (def.costTier === 'free') {
      baseScore += 20;
    } else if (def.costTier === 'optional_purchase') {
      baseScore -= 30;
    }
  }

  // ID-SPECIFIC RULE EVALUATION
  switch (def.id) {
    // ----------------------------------------------------
    // PROTECT YOUR HOUSEHOLD
    // ----------------------------------------------------
    case 'vulnerable_exposure_restriction': {
      if (!hasVulnerable) {
        return null; // Not applicable if no vulnerable members
      }
      const vulnerableList: string[] = [];
      if (profile.hasYoungChildren) vulnerableList.push('child under 5');
      if (profile.hasOlderAdults) vulnerableList.push('senior citizen');
      if (profile.hasPregnantMember) vulnerableList.push('pregnant member');
      if (profile.hasRespiratoryCardioVulnerability)
        vulnerableList.push('respiratory/cardiac vulnerability');

      contextTags.push(`Vulnerable household: ${vulnerableList.join(', ')}`);

      if (isSevere) {
        baseScore += 65;
        dynamicPriority = 'critical';
        whyRelevantNow = `Severe pollution alert (Modelled PM2.5: ${currentPm25} µg/m³). Young children and vulnerable family members face severe airway inflammation and bronchospasm risks during outdoor activity.`;
      } else if (isElevated) {
        baseScore += 45;
        dynamicPriority = 'high';
        whyRelevantNow = `Elevated pollution levels (Modelled PM2.5: ${currentPm25} µg/m³). High risk of respiratory symptoms in children and vulnerable members.`;
      } else {
        baseScore += 10;
        dynamicPriority = 'medium';
      }
      break;
    }

    case 'well_fitted_n95_protection': {
      const isOutdoorCommuter =
        profile.primaryTransport === 'motorcycle' ||
        profile.primaryTransport === 'walking' ||
        profile.primaryTransport === 'bicycle' ||
        profile.primaryTransport === 'bus';

      if (isOutdoorCommuter) {
        contextTags.push(`Active outdoor commuter (${profile.primaryTransport})`);
        baseScore += 40;
      }
      if (profile.dailyOutdoorHours >= 3) {
        contextTags.push(`Long outdoor exposure (${profile.dailyOutdoorHours} hrs/day)`);
        baseScore += 30;
      }
      if (hasVulnerable) {
        baseScore += 25;
      }

      if (isSevere) {
        baseScore += 50;
        dynamicPriority = 'critical';
        whyRelevantNow = `With modelled ambient PM2.5 at ${currentPm25} µg/m³ in ${env.location.name}, non-certified cloth coverings offer inadequate protection against sub-micron toxic aerosols during transit.`;
      } else if (isElevated) {
        baseScore += 30;
        dynamicPriority = 'high';
        whyRelevantNow = `Elevated PM2.5 levels (${currentPm25} µg/m³) warrant mechanical barrier protection during daily travel.`;
      } else {
        baseScore += 5;
        dynamicPriority = 'medium';
      }
      break;
    }

    case 'reschedule_outdoor_errands': {
      if (profile.limitedTimingFlexibility) {
        baseScore -= 20; // Harder for user to reschedule
        contextTags.push('Fixed timing constraint noted');
      } else {
        baseScore += 25;
        contextTags.push('Flexible daily schedule');
      }

      if (env.trend.troughHour) {
        contextTags.push('Diurnal pollution variation detected');
        whyRelevantNow = `Forecast indicates diurnal inversion. Lower relative concentrations expected around mid-afternoon (~12:00–15:30). Shift errands away from morning peaks.`;
      }

      if (isSevere || isElevated) {
        baseScore += 35;
        dynamicPriority = 'high';
      }
      break;
    }

    // ----------------------------------------------------
    // IMPROVE INDOOR AIR
    // ----------------------------------------------------
    case 'eliminate_incense_mosquito_coils': {
      if (!profile.usesIncenseOrMosquitoCoils && !profile.hasIndoorSmoking) {
        return null; // Not applicable if user does not burn indoor items
      }
      contextTags.push(
        profile.usesIncenseOrMosquitoCoils
          ? 'Indoor incense/mosquito coil usage'
          : 'Indoor smoke exposure'
      );
      baseScore += 70; // Top free action to eliminate source
      dynamicPriority = 'critical';
      whyRelevantNow = `Detected indoor combustion source in your household. Burning incense or coils indoors creates dangerous micro-environment PM2.5 spikes often exceeding outdoor smog.`;
      break;
    }

    case 'biomass_fuel_transition': {
      if (
        profile.cookingFuel !== 'biomass_wood_coal' &&
        profile.cookingFuel !== 'kerosene'
      ) {
        return null; // Not applicable
      }
      contextTags.push(`High-emission cooking fuel (${profile.cookingFuel})`);
      baseScore += 115; // Critical household hazard
      dynamicPriority = 'critical';
      whyRelevantNow = `Solid biomass/kerosene combustion produces dangerous levels of respirable soot, carbon monoxide, and toxic VOCs right inside the living space.`;
      break;
    }

    case 'kitchen_exhaust_protocol': {
      if (profile.cookingVentilation === 'chimney_exhaust') {
        baseScore += 20; // Reinforce good practice
        contextTags.push('Kitchen chimney available');
      } else if (
        profile.cookingVentilation === 'window_only' ||
        profile.cookingVentilation === 'poor_none'
      ) {
        baseScore += 50; // Critical need for ventilation
        dynamicPriority = 'high';
        contextTags.push('Limited kitchen ventilation');
        whyRelevantNow = `Without mechanical kitchen exhaust, culinary smoke and volatile oils accumulate in bedrooms and living rooms for hours.`;
      } else {
        baseScore += 30;
      }
      break;
    }

    case 'conditional_natural_ventilation': {
      if (isSevere) {
        // In severe smog, do NOT recommend wide window opening
        whyRelevantNow = `Outdoor PM2.5 is severe (${currentPm25} µg/m³). Keep exterior windows sealed during morning and evening rush hours. Use brief 10–15 min afternoon leeward flush only if air feels stuffy.`;
        baseScore += 20;
      } else if (isElevated) {
        whyRelevantNow = `Outdoor PM2.5 is elevated (${currentPm25} µg/m³). Vent selectively during midday trough (13:00–15:00) on sheltered building side, avoiding morning rush hours.`;
        baseScore += 30;
      } else {
        baseScore += 35;
        whyRelevantNow = `Outdoor conditions allow structured cross-ventilation to refresh indoor oxygen and disperse accumulated moisture and CO2.`;
      }
      break;
    }

    case 'wet_mopping_dust_control': {
      baseScore += 40; // Universal zero-cost high-impact
      if (profile.hasYoungChildren) {
        baseScore += 30;
        contextTags.push('Young children crawling on floor');
      }
      if (isElevated || isSevere) {
        baseScore += 20;
        dynamicPriority = 'high';
        whyRelevantNow = `High ambient dust and particulate infiltration settles onto floors. Dry sweeping resuspends toxic particles right into breathing heights.`;
      }
      break;
    }

    case 'purifier_hepa_optimization': {
      if (!profile.hasAirPurifier) {
        return null; // Do not push air purifier instructions if user does not have one
      }
      contextTags.push('Air purifier available in home');
      baseScore += 45;
      if (isSevere) {
        baseScore += 35;
        dynamicPriority = 'high';
        whyRelevantNow = `Severe outdoor smog penetrates building cracks. Operating your HEPA purifier in an enclosed bedroom creates a clean air sanctuary.`;
      }
      break;
    }

    case 'ac_recirculation_protocol': {
      if (!profile.hasAcWithRecirculation) {
        return null; // Do not recommend if not equipped
      }
      contextTags.push('AC with recirculation available');
      baseScore += 35;
      if (isElevated || isSevere) {
        baseScore += 25;
        dynamicPriority = 'medium';
        whyRelevantNow = `Outdoor air contains high particulate concentrations. Ensure AC is set to recirculation mode to avoid drawing untreated outdoor air inside.`;
      }
      break;
    }

    // ----------------------------------------------------
    // PLAN OUTDOOR ACTIVITIES
    // ----------------------------------------------------
    case 'indoor_exercise_substitution': {
      if (!profile.frequentOutdoorExercise) {
        return null; // Not relevant if user does not exercise outdoors
      }
      contextTags.push('Regular outdoor exercise routine');
      if (isSevere) {
        baseScore += 60;
        dynamicPriority = 'critical';
        whyRelevantNow = `Modelled PM2.5 is ${currentPm25} µg/m³. Strenuous outdoor running or cycling dramatically increases pulmonary ventilation, pulling soot deep into alveolar lung tissues.`;
      } else if (isElevated) {
        baseScore += 45;
        dynamicPriority = 'high';
        whyRelevantNow = `Elevated pollution (${currentPm25} µg/m³) makes vigorous outdoor cardiovascular exercise counter-productive to cardiopulmonary health.`;
      } else {
        baseScore += 15;
      }
      break;
    }

    case 'avoid_busy_transit_corridors': {
      const isPedestrianOrCyclist =
        profile.primaryTransport === 'walking' ||
        profile.primaryTransport === 'bicycle';

      if (!isPedestrianOrCyclist && profile.dailyOutdoorHours < 2) {
        baseScore -= 20;
      } else {
        baseScore += 35;
        contextTags.push(`Local active transit (${profile.primaryTransport})`);
      }

      if (isElevated || isSevere) {
        baseScore += 25;
        dynamicPriority = 'high';
        whyRelevantNow = `Heavy traffic corridors concentrate fresh diesel soot, carbon monoxide, and toxic tyre wear particles. Moving one block away sharply reduces peak exposure.`;
      }
      break;
    }

    // ----------------------------------------------------
    // CHOOSE CLEANER MOBILITY
    // ----------------------------------------------------
    case 'two_wheeler_commute_mitigation': {
      if (profile.primaryTransport !== 'motorcycle') {
        return null; // Only for two-wheeler commuters
      }
      contextTags.push('Motorcycle/scooter primary transit');
      baseScore += 65;
      if (isSevere || isElevated) {
        dynamicPriority = 'critical';
        whyRelevantNow = `Open two-wheeler commuters face unbuffered exposure to direct tailpipe plumes, road dust, and cold winter air.`;
      }
      break;
    }

    case 'prefer_electric_metro_rail': {
      if (profile.limitedPublicTransportAccess) {
        return null; // Do not recommend metro if user has limited public transit access
      }
      if (
        profile.primaryTransport === 'private_car' ||
        profile.primaryTransport === 'motorcycle'
      ) {
        contextTags.push('Private vehicle user with transit access');
        baseScore += 45;
        if (isSevere || isElevated) {
          dynamicPriority = 'high';
          whyRelevantNow = `Grade-separated electric metro systems provide filtered air and bypass congested surface smog while slashing individual transport emissions.`;
        }
      } else if (profile.primaryTransport === 'metro_rail') {
        baseScore += 20;
        contextTags.push('Regular metro commuter');
      }
      break;
    }

    case 'trip_chaining_consolidation': {
      if (profile.primaryTransport === 'private_car') {
        contextTags.push('Private car user');
        baseScore += 40;
      } else {
        baseScore += 20;
      }
      if (isElevated || isSevere) {
        baseScore += 20;
        whyRelevantNow = `Consolidating errands limits cold-start vehicle emissions and reduces the hours your family spends in roadside traffic queues.`;
      }
      break;
    }

    // ----------------------------------------------------
    // REDUCE HOUSEHOLD EMISSIONS
    // ----------------------------------------------------
    case 'anti_idling_switch_off': {
      if (
        profile.primaryTransport === 'private_car' ||
        profile.primaryTransport === 'motorcycle'
      ) {
        contextTags.push(`Motor vehicle operator (${profile.primaryTransport})`);
        baseScore += 45;
      } else {
        baseScore += 15;
      }
      if (isElevated || isSevere) {
        baseScore += 20;
        whyRelevantNow = `Traffic congestion during winter inversions creates extreme ground-level toxic pockets. Turning off your engine at long signals reduces cumulative community smog.`;
      }
      break;
    }

    case 'servicing_tire_pressure_efficiency': {
      if (
        profile.primaryTransport !== 'private_car' &&
        profile.primaryTransport !== 'motorcycle'
      ) {
        return null; // Not applicable to non-motorized users
      }
      contextTags.push(`Vehicle owner (${profile.primaryTransport})`);
      baseScore += 25;
      break;
    }

    // ----------------------------------------------------
    // COMMUNITY ACTION
    // ----------------------------------------------------
    case 'school_idle_free_zone': {
      if (profile.hasYoungChildren || profile.primaryRoutine === 'school_commute') {
        contextTags.push('School-going children in household');
        baseScore += 55;
        dynamicPriority = 'high';
        whyRelevantNow = `Idling cars outside school gates create dense micro-pollution hotspots at the exact standing height of young school children.`;
      } else {
        baseScore += 10;
      }
      break;
    }

    case 'report_stop_open_waste_burning': {
      baseScore += 40; // Always highly relevant in winter urban environments
      if (isElevated || isSevere) {
        baseScore += 25;
        dynamicPriority = 'high';
        whyRelevantNow = `Winter temperature drops frequently induce illegal waste, leaf, and biomass burning by night-shift workers and street sweepers, producing toxic plumes.`;
      }
      break;
    }

    case 'neighbourhood_dust_suppression': {
      if (currentPm10 > 150) {
        baseScore += 40;
        contextTags.push(`High coarse dust load (PM10: ${currentPm10} µg/m³)`);
        whyRelevantNow = `Elevated PM10 levels indicate high mineral and road dust re-entrainment. Light misting on unpaved lanes suppresses dust clouds.`;
      } else {
        baseScore += 20;
      }
      break;
    }

    case 'carpooling_shared_school_transport': {
      if (profile.hasYoungChildren || profile.primaryRoutine === 'school_commute') {
        contextTags.push('School commute household');
        baseScore += 45;
        dynamicPriority = 'medium';
      } else if (profile.primaryTransport === 'private_car') {
        contextTags.push('Solo car commuter');
        baseScore += 35;
      } else {
        baseScore += 15;
      }
      break;
    }

    default:
      break;
  }

  return {
    definition: def,
    score: baseScore,
    dynamicPriority,
    whyRelevantNow,
    applicableContext: contextTags,
  };
}
