import { ModelledAirQuality } from '@/types/air-quality';
import { HouseholdProfile } from '@/types/household';
import {
  ActionCategory,
  ActionRecommendation,
  RankedRecommendationResult,
  TimeContext,
} from '@/types/recommendations';
import { ACTION_CATALOG } from '../recommendations/catalog';
import { evaluateActionRelevance } from './rules';

export function evaluateRecommendations(
  env: ModelledAirQuality,
  profile: HouseholdProfile
): RankedRecommendationResult {
  const evaluatedCandidates: {
    rec: ActionRecommendation;
    score: number;
  }[] = [];

  for (const def of ACTION_CATALOG) {
    const candidate = evaluateActionRelevance(def, env, profile);
    if (!candidate) continue;

    const recommendation: ActionRecommendation = {
      id: def.id,
      title: def.baseTitle,
      category: def.category,
      priority: candidate.dynamicPriority,
      timeContext: def.defaultTimeContext,
      whatToDo: def.whatToDoTemplate,
      whyRelevantNow: candidate.whyRelevantNow,
      applicableHouseholdContext: candidate.applicableContext,
      expectedBenefit: def.expectedBenefit,
      exposureProtectionImpact: def.exposureProtectionImpact,
      emissionsReductionImpact: def.emissionsReductionImpact,
      estimatedEffort: def.estimatedEffort,
      costTier: def.costTier,
      evidenceSource: def.evidenceSource,
      limitations: def.limitations,
    };

    evaluatedCandidates.push({
      rec: recommendation,
      score: candidate.score,
    });
  }

  // Sort descending by score
  evaluatedCandidates.sort((a, b) => b.score - a.score);

  const allRecommendations = evaluatedCandidates.map((c) => c.rec);
  const topThreeActions = allRecommendations.slice(0, 3);

  // Group by TimeContext
  const groupedByTimeContext: Record<TimeContext, ActionRecommendation[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    at_home: [],
    commuting: [],
  };

  for (const action of allRecommendations) {
    groupedByTimeContext[action.timeContext].push(action);
  }

  // Group by Category
  const groupedByCategory: Record<ActionCategory, ActionRecommendation[]> = {
    protect_household: [],
    indoor_air: [],
    outdoor_planning: [],
    cleaner_mobility: [],
    reduce_emissions: [],
    community_action: [],
  };

  const categoryCounts: Record<ActionCategory, number> = {
    protect_household: 0,
    indoor_air: 0,
    outdoor_planning: 0,
    cleaner_mobility: 0,
    reduce_emissions: 0,
    community_action: 0,
  };

  for (const action of allRecommendations) {
    groupedByCategory[action.category].push(action);
    categoryCounts[action.category]++;
  }

  // Find dominant category
  let dominantCategory: ActionCategory = 'protect_household';
  let maxCount = -1;
  for (const [cat, count] of Object.entries(categoryCounts) as [
    ActionCategory,
    number,
  ][]) {
    if (count > maxCount) {
      maxCount = count;
      dominantCategory = cat;
    }
  }

  const freeCount = allRecommendations.filter((a) => a.costTier === 'free').length;
  const criticalCount = allRecommendations.filter(
    (a) => a.priority === 'critical'
  ).length;

  return {
    topThreeActions,
    allRecommendations,
    groupedByTimeContext,
    groupedByCategory,
    summary: {
      totalCount: allRecommendations.length,
      freeCount,
      criticalCount,
      dominantCategory,
    },
  };
}
