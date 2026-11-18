export type ActionCategory =
  | 'protect_household'
  | 'indoor_air'
  | 'outdoor_planning'
  | 'cleaner_mobility'
  | 'reduce_emissions'
  | 'community_action';

export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';

export type TimeContext =
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'at_home'
  | 'commuting';

export type CostTier = 'free' | 'low_cost' | 'optional_purchase';

export type EffortLevel = 'low' | 'medium' | 'high';

export interface ActionRecommendation {
  id: string;
  title: string;
  category: ActionCategory;
  priority: ActionPriority;
  timeContext: TimeContext;
  whatToDo: string;
  whyRelevantNow: string;
  applicableHouseholdContext: string[];
  expectedBenefit: string;
  exposureProtectionImpact: string; // Separate: Exposure protection
  emissionsReductionImpact: string; // Separate: Emissions reduction
  estimatedEffort: EffortLevel;
  costTier: CostTier;
  evidenceSource: string;
  limitations: string;
}

export interface RankedRecommendationResult {
  topThreeActions: ActionRecommendation[];
  allRecommendations: ActionRecommendation[];
  groupedByTimeContext: Record<TimeContext, ActionRecommendation[]>;
  groupedByCategory: Record<ActionCategory, ActionRecommendation[]>;
  summary: {
    totalCount: number;
    freeCount: number;
    criticalCount: number;
    dominantCategory: ActionCategory;
  };
}
