'use client';

import React from 'react';
import {
  Wind,
  MapPin,
  RefreshCw,
  Home,
  CheckSquare,
  ShieldAlert,
  Users,
  Sparkles,
  LayoutDashboard,
  Layers,
} from 'lucide-react';
import { GeoLocation } from '@/types/air-quality';
import { Badge } from './Badge';

export type NavTab =
  | 'overview'
  | 'household'
  | 'indoor'
  | 'planner'
  | 'community'
  | 'assistant';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  location: GeoLocation;
  onOpenLocationSearch: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  isDemoMode: boolean;
  onToggleDemoModal: () => void;
  activeDemoName?: string;
  onExitDemo: () => void;
}

export function Navbar({
  activeTab,
  onSelectTab,
  location,
  onOpenLocationSearch,
  onRefreshData,
  isRefreshing,
  isDemoMode,
  onToggleDemoModal,
  activeDemoName,
  onExitDemo,
}: NavbarProps) {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'household',
      label: 'My Household',
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'indoor',
      label: 'Indoor Air',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    {
      id: 'planner',
      label: 'Daily Planner',
      icon: <CheckSquare className="w-4 h-4" />,
    },
    {
      id: 'community',
      label: 'Community',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'assistant',
      label: 'AI Assistant',
      icon: <Sparkles className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Banner if in Demo Mode */}
      {isDemoMode && (
        <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-medium flex items-center justify-between border-b border-amber-600">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider bg-amber-900 text-amber-100 px-1.5 py-0.5 rounded text-[10px]">
              Demo Mode Active
            </span>
            <span>
              Simulating scenario: <strong>{activeDemoName || 'Custom'}</strong> (Demonstration values only)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleDemoModal}
              className="underline hover:text-amber-900 text-xs font-semibold cursor-pointer"
            >
              Switch Scenario
            </button>
            <button
              onClick={onExitDemo}
              className="bg-amber-950 text-white px-2 py-0.5 rounded text-xs hover:bg-black transition-colors cursor-pointer"
            >
              Exit to Live Data
            </button>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
              <Wind className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  AeroWise
                </span>
                <span className="hidden sm:inline-block">
                  <Badge variant="primary" size="sm">
                    Action Engine
                  </Badge>
                </span>
              </div>
              <p className="text-[11px] text-slate-600 hidden md:block">
                Your daily air-quality action planner
              </p>
            </div>
          </div>

          {/* Location & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Location Selector Button */}
            <button
              onClick={onOpenLocationSearch}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs sm:text-sm font-medium border border-slate-200 transition-colors cursor-pointer"
              title="Change City"
              aria-label="Select location"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="truncate max-w-[130px] sm:max-w-[200px]">
                {location.name}
                {location.admin1 ? `, ${location.admin1}` : ''}
              </span>
            </button>

            {/* Refresh Button */}
            {!isDemoMode && (
              <button
                onClick={onRefreshData}
                disabled={isRefreshing}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                title="Refresh Air Quality Data"
                aria-label="Refresh forecast"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`}
                />
              </button>
            )}

            {/* Scenarios Button */}
            <button
              onClick={onToggleDemoModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
              title="Test Scenarios"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Scenarios</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 pt-1 border-t border-slate-100 no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs font-semibold'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
