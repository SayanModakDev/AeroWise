'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Share2,
  Check,
  Sparkles,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import {
  ActionCategory,
  CostTier,
  RankedRecommendationResult,
  TimeContext,
} from '@/types/recommendations';
import { ModelledAirQuality } from '@/types/air-quality';
import {
  loadCompletedChecklist,
  saveCompletedChecklist,
} from '@/lib/storage/household-storage';
import { ActionCard } from './ActionCard';
import { Card } from '../ui/Card';

interface DailyPlannerProps {
  recommendations: RankedRecommendationResult;
  airQuality: ModelledAirQuality;
  onNavigateToHousehold: () => void;
}

export function DailyPlanner({
  recommendations,
  airQuality,
  onNavigateToHousehold,
}: DailyPlannerProps) {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [selectedTimeContext, setSelectedTimeContext] = useState<
    TimeContext | 'all'
  >('all');
  const [selectedCostTier, setSelectedCostTier] = useState<CostTier | 'all'>(
    'all'
  );
  const [selectedCategory, setSelectedCategory] = useState<
    ActionCategory | 'all'
  >('all');
  const [copiedToast, setCopiedToast] = useState(false);

  // Load checklist state
  useEffect(() => {
    setCompletedIds(loadCompletedChecklist());
  }, []);

  const handleToggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id];
      saveCompletedChecklist(next);
      return next;
    });
  };

  const handleResetChecklist = () => {
    setCompletedIds([]);
    saveCompletedChecklist([]);
  };

  // Generate shareable text summary
  const handleCopySharePlan = () => {
    const cityName = airQuality.location.name;
    const pm25 = airQuality.current.pm2_5 ?? 'N/A';
    const top3 = recommendations.topThreeActions;

    const lines: string[] = [
      `🌱 *AeroWise Daily Action Plan for ${cityName}*`,
      `📍 Modelled PM2.5: ${pm25} µg/m³ · Trend: ${airQuality.trend.direction.toUpperCase()}`,
      `📅 Generated: ${new Date().toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      })}`,
      '',
      `⭐ *TOP 3 PRIORITY ACTIONS:*`,
      ...top3.map(
        (a, i) =>
          `${i + 1}. *${a.title}* (${a.costTier === 'free' ? 'Free' : 'Low Cost'})\n   👉 ${a.whatToDo}`
      ),
      '',
      `🕒 *TODAY'S SCHEDULE HIGHLIGHTS:*`,
      ...recommendations.allRecommendations
        .slice(0, 6)
        .map(
          (a) =>
            `• [${a.timeContext.replace('_', ' ').toUpperCase()}] ${a.title}`
        ),
      '',
      `_Values from atmospheric forecast models (CAMS Global). For statutory Indian monitoring, visit app.cpcbccr.com/AQI_India/_`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  // Filtering actions
  const filteredActions = recommendations.allRecommendations.filter((action) => {
    if (selectedTimeContext !== 'all' && action.timeContext !== selectedTimeContext) {
      return false;
    }
    if (selectedCostTier !== 'all' && action.costTier !== selectedCostTier) {
      return false;
    }
    if (selectedCategory !== 'all' && action.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  const completedCount = completedIds.filter((id) =>
    recommendations.allRecommendations.some((a) => a.id === id)
  ).length;
  const totalCount = recommendations.allRecommendations.length;
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Priority Showcase Banner */}
      <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-teal-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-teal-800/80">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Today&apos;s Top 3 Priority Actions
              </h2>
            </div>
            <p className="text-xs text-teal-200/80 mt-1">
              Personalized for {airQuality.location.name} based on modelled PM2.5 of{' '}
              {airQuality.current.pm2_5 ?? '—'} µg/m³ and your household setup.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleCopySharePlan}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              {copiedToast ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Action Plan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Top 3 List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
          {recommendations.topThreeActions.map((action, idx) => (
            <div
              key={action.id}
              className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/10 flex flex-col justify-between space-y-2"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-teal-300">
                  <span className="font-bold">#0{idx + 1} Priority</span>
                  <span className="capitalize font-mono">
                    {action.costTier === 'free' ? '100% Free' : 'Low Cost'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white leading-snug">
                  {action.title}
                </h4>
              </div>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {action.whatToDo}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Checklist Progress & Filter Bar */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Daily Execution Checklist
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>
                {completedCount} of {totalCount} actions completed ({progressPct}%)
              </span>
              <div className="w-24 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {completedCount > 0 && (
              <button
                onClick={handleResetChecklist}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Checks</span>
              </button>
            )}
            <button
              onClick={onNavigateToHousehold}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 cursor-pointer"
            >
              Adjust Household Setup <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="space-y-2 text-xs">
          {/* Time Context */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-500 mr-1">Time:</span>
            {[
              { id: 'all', label: 'All Times' },
              { id: 'morning', label: 'Morning' },
              { id: 'afternoon', label: 'Afternoon' },
              { id: 'evening', label: 'Evening' },
              { id: 'at_home', label: 'At Home' },
              { id: 'commuting', label: 'Commuting' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTimeContext(t.id as TimeContext | 'all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedTimeContext === t.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Cost Tier */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="font-semibold text-slate-500 mr-1">Cost:</span>
            {[
              { id: 'all', label: 'Any Cost' },
              { id: 'free', label: '100% Free' },
              { id: 'low_cost', label: 'Low Cost' },
              { id: 'optional_purchase', label: 'Optional Purchase' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCostTier(c.id as CostTier | 'all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedCostTier === c.id
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="font-semibold text-slate-500 mr-1">Goal:</span>
            {[
              { id: 'all', label: 'All Goals' },
              { id: 'protect_household', label: 'Protect Family' },
              { id: 'indoor_air', label: 'Indoor Air' },
              { id: 'outdoor_planning', label: 'Outdoor Plans' },
              { id: 'cleaner_mobility', label: 'Commute' },
              { id: 'reduce_emissions', label: 'Reduce Emissions' },
              { id: 'community_action', label: 'Community' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as ActionCategory | 'all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Rendered Action Cards */}
      <div className="space-y-3">
        {filteredActions.length > 0 ? (
          filteredActions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              isCompleted={completedIds.includes(action.id)}
              onToggleComplete={handleToggleComplete}
              isTopPriority={recommendations.topThreeActions.some(
                (t) => t.id === action.id
              )}
            />
          ))
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No recommendations match your current filter selections. Try selecting
            &ldquo;All Times&rdquo; or &ldquo;Any Cost&rdquo;.
          </div>
        )}
      </div>
    </div>
  );
}
