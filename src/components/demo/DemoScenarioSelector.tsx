'use client';

import React from 'react';
import { X, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import { DEMO_SCENARIOS, DemoScenario } from '@/lib/demo/scenarios';
import { Badge } from '../ui/Badge';

interface DemoScenarioSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: DemoScenario) => void;
  activeScenarioId?: string;
  isDemoMode: boolean;
  onExitDemo: () => void;
}

export function DemoScenarioSelector({
  isOpen,
  onClose,
  onSelectScenario,
  activeScenarioId,
  isDemoMode,
  onExitDemo,
}: DemoScenarioSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="scenario-selector-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="scenario-selector-title"
                className="text-base sm:text-lg font-bold text-slate-900"
              >
                Demonstration & Stress-Testing Scenarios
              </h2>
              <p className="text-xs text-slate-500">
                Evaluate AeroWise decision engine across real-world urban hardship profiles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="px-5 py-3 bg-amber-50/70 border-b border-amber-100 text-xs text-amber-900 flex items-center justify-between">
          <span>
            Demonstration scenarios load realistic calibrated conditions to test the Air-to-Action Decision Engine without waiting for weather shifts.
          </span>
          {isDemoMode && (
            <button
              onClick={() => {
                onExitDemo();
                onClose();
              }}
              className="ml-3 shrink-0 px-2.5 py-1 bg-amber-950 text-white font-medium rounded-lg hover:bg-black transition-colors cursor-pointer"
            >
              Exit to Live Data
            </button>
          )}
        </div>

        {/* List of 5 Scenarios */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {DEMO_SCENARIOS.map((sc) => {
            const isActive = isDemoMode && activeScenarioId === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  onSelectScenario(sc);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-indigo-50/80 border-indigo-400 ring-1 ring-indigo-400'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm sm:text-base text-slate-900">
                      {sc.name}
                    </span>
                    <Badge variant="purple" size="sm">
                      {sc.badge}
                    </Badge>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sc.description}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span>
                      Modelled PM2.5: {sc.airQuality.current.pm2_5} µg/m³
                    </span>
                    <span>·</span>
                    <span>
                      Fuel: {sc.profile.cookingFuel.replace(/_/g, ' ')}
                    </span>
                    <span>·</span>
                    <span>Budget: {sc.profile.budgetTier.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <div className="sm:self-center shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900">
                    Apply Scenario <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
