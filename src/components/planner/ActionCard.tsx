'use client';

import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Shield,
  Leaf,
  Clock,
  Info,
  Tag,
} from 'lucide-react';
import { ActionRecommendation } from '@/types/recommendations';
import { Badge } from '../ui/Badge';

interface ActionCardProps {
  action: ActionRecommendation;
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
  isTopPriority?: boolean;
}

export function ActionCard({
  action,
  isCompleted,
  onToggleComplete,
  isTopPriority = false,
}: ActionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  const getCostBadgeVariant = (cost: string) => {
    switch (cost) {
      case 'free':
        return 'success';
      case 'low_cost':
        return 'primary';
      default:
        return 'purple';
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isCompleted
          ? 'bg-slate-50/70 border-slate-200 opacity-80'
          : isTopPriority
          ? 'bg-white border-teal-300 shadow-md ring-1 ring-teal-200'
          : 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300'
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Header row with Checkbox, Title, and Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              onClick={() => onToggleComplete(action.id)}
              className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                isCompleted
                  ? 'bg-teal-600 border-teal-600 text-white'
                  : 'bg-white border-slate-300 hover:border-teal-500'
              }`}
              title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
              aria-label={`Mark ${action.title} as completed`}
            >
              {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-sm sm:text-base font-bold ${
                    isCompleted
                      ? 'line-through text-slate-500'
                      : 'text-slate-900'
                  }`}
                >
                  {action.title}
                </span>
                {isTopPriority && (
                  <Badge variant="primary" size="sm">
                    Top Priority
                  </Badge>
                )}
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <Badge
                  variant={getPriorityBadgeVariant(action.priority)}
                  size="sm"
                >
                  {action.priority.toUpperCase()}
                </Badge>
                <Badge variant={getCostBadgeVariant(action.costTier)} size="sm">
                  {action.costTier === 'free'
                    ? '100% Free'
                    : action.costTier === 'low_cost'
                    ? 'Low Cost'
                    : 'Optional Purchase'}
                </Badge>
                <Badge variant="neutral" size="sm">
                  Effort: {action.estimatedEffort}
                </Badge>
                <span className="text-[11px] text-slate-500 capitalize flex items-center gap-1 ml-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {action.timeContext.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label={isExpanded ? 'Collapse action' : 'Expand action details'}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* What To Do - Always visible */}
        <div className="mt-3 text-xs sm:text-sm text-slate-700 leading-relaxed pl-8">
          <p>{action.whatToDo}</p>
        </div>

        {/* Why Relevant Now - Always visible */}
        <div className="mt-2.5 pl-8 text-xs text-slate-500 flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
          <span className="italic">{action.whyRelevantNow}</span>
        </div>

        {/* Context tags */}
        {action.applicableHouseholdContext.length > 0 && (
          <div className="mt-3 pl-8 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-400 font-medium">Triggered by:</span>
            {action.applicableHouseholdContext.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md font-medium"
              >
                <Tag className="w-2.5 h-2.5 text-slate-400" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Expandable Deep Impact & Evidence Section */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-100 pl-8 space-y-3 animate-in fade-in duration-150 text-xs">
            {/* Split Impact Explanation: Exposure Protection vs Emissions Reduction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-teal-900">
                  <Shield className="w-3.5 h-3.5 text-teal-700" />
                  <span>Exposure Protection Impact</span>
                </div>
                <p className="text-teal-950 leading-relaxed text-[11px]">
                  {action.exposureProtectionImpact}
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Emissions Reduction Impact</span>
                </div>
                <p className="text-emerald-950 leading-relaxed text-[11px]">
                  {action.emissionsReductionImpact}
                </p>
              </div>
            </div>

            {/* Expected Practical Benefit */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-800 block text-[11px]">
                Expected Practical Benefit:
              </span>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {action.expectedBenefit}
              </p>
            </div>

            {/* Evidence & Limitations */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
              <div>
                <span className="font-medium text-slate-600">Evidence Source: </span>
                <span>{action.evidenceSource}</span>
              </div>
              {action.limitations && (
                <div className="text-slate-500 italic max-w-sm">
                  <span>Note: {action.limitations}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
