'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GeoLocation,
  ModelledAirQuality,
} from '@/types/air-quality';
import {
  HouseholdProfile,
  DEFAULT_HOUSEHOLD_PROFILE,
} from '@/types/household';
import {
  fetchAirQuality,
  POPULAR_CITIES,
} from '@/lib/air-quality/open-meteo';
import { evaluateRecommendations } from '@/lib/decision-engine/engine';
import {
  loadHouseholdProfile,
  saveHouseholdProfile,
  resetHouseholdProfile,
} from '@/lib/storage/household-storage';
import { DEMO_SCENARIOS, DemoScenario } from '@/lib/demo/scenarios';
import { Navbar, NavTab } from '@/components/ui/Navbar';
import { CitySearchModal } from '@/components/location/CitySearchModal';
import { DemoScenarioSelector } from '@/components/demo/DemoScenarioSelector';
import { AirQualityOverview } from '@/components/overview/AirQualityOverview';
import { HouseholdSetup } from '@/components/household/HouseholdSetup';
import { IndoorAirGuardian } from '@/components/indoor/IndoorAirGuardian';
import { DailyPlanner } from '@/components/planner/DailyPlanner';
import { CommunityActionBoard } from '@/components/community/CommunityActionBoard';
import { AssistantChat } from '@/components/assistant/AssistantChat';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [location, setLocation] = useState<GeoLocation>(POPULAR_CITIES[0]); // New Delhi default
  const [airQuality, setAirQuality] = useState<ModelledAirQuality | null>(null);
  const [profile, setProfile] = useState<HouseholdProfile>(DEFAULT_HOUSEHOLD_PROFILE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeDemoScenario, setActiveDemoScenario] = useState<DemoScenario | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Load saved household profile from localStorage on mount
  useEffect(() => {
    setProfile(loadHouseholdProfile());
  }, []);

  // Fetch air quality data for location
  const loadData = useCallback(
    async (loc: GeoLocation, forceRefresh = false) => {
      setIsRefreshing(true);
      setFetchError(null);
      try {
        const result = await fetchAirQuality(loc, forceRefresh);
        setAirQuality(result);
        setIsDemoMode(false);
        setActiveDemoScenario(null);
      } catch (err) {
        console.warn('Network fetch error, falling back to cached or demo scenario:', err);
        setFetchError(
          err instanceof Error
            ? err.message
            : 'Unable to connect to air quality service.'
        );
        // Fallback to scenario 1 if initial fetch fails
        if (!airQuality) {
          const fallbackScenario = DEMO_SCENARIOS[0];
          setAirQuality(fallbackScenario.airQuality);
          setIsDemoMode(true);
          setActiveDemoScenario(fallbackScenario);
        }
      } finally {
        setIsRefreshing(false);
      }
    },
    [airQuality]
  );

  // Initial load
  useEffect(() => {
    loadData(location);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle location selection
  const handleSelectLocation = (newLoc: GeoLocation) => {
    setLocation(newLoc);
    loadData(newLoc, true);
  };

  // Handle profile update
  const handleUpdateProfile = (updated: HouseholdProfile) => {
    setProfile(updated);
    saveHouseholdProfile(updated);
  };

  // Handle profile reset
  const handleResetProfile = () => {
    const fresh = resetHouseholdProfile();
    setProfile(fresh);
  };

  // Handle demo scenario selection
  const handleSelectScenario = (sc: DemoScenario) => {
    setIsDemoMode(true);
    setActiveDemoScenario(sc);
    setLocation(sc.location);
    setAirQuality(sc.airQuality);
    setProfile(sc.profile);
    setFetchError(null);
  };

  // Exit demo mode back to live
  const handleExitDemo = () => {
    setIsDemoMode(false);
    setActiveDemoScenario(null);
    setProfile(loadHouseholdProfile());
    loadData(location, true);
  };

  // Evaluate recommendations dynamically using the Decision Engine
  const recommendations = useMemo(() => {
    if (!airQuality) return null;
    return evaluateRecommendations(airQuality, profile);
  }, [airQuality, profile]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        location={location}
        onOpenLocationSearch={() => setIsCityModalOpen(true)}
        onRefreshData={() => loadData(location, true)}
        isRefreshing={isRefreshing}
        isDemoMode={isDemoMode}
        onToggleDemoModal={() => setIsDemoModalOpen(true)}
        activeDemoName={activeDemoScenario?.name}
        onExitDemo={handleExitDemo}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {fetchError && !isDemoMode && (
          <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs flex items-center justify-between">
            <span>
              <strong>Network Notice:</strong> {fetchError}. Serving available
              cached/fallback environmental data.
            </span>
            <button
              onClick={() => loadData(location, true)}
              className="ml-3 font-semibold underline hover:text-amber-950 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab Views */}
        {airQuality && recommendations ? (
          <>
            {activeTab === 'overview' && (
              <AirQualityOverview
                airQuality={airQuality}
                isDemoMode={isDemoMode}
              />
            )}

            {activeTab === 'household' && (
              <HouseholdSetup
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onResetProfile={handleResetProfile}
              />
            )}

            {activeTab === 'indoor' && (
              <IndoorAirGuardian
                profile={profile}
                airQuality={airQuality}
                onNavigateToHousehold={() => setActiveTab('household')}
              />
            )}

            {activeTab === 'planner' && (
              <DailyPlanner
                recommendations={recommendations}
                airQuality={airQuality}
                onNavigateToHousehold={() => setActiveTab('household')}
              />
            )}

            {activeTab === 'community' && <CommunityActionBoard />}

            {activeTab === 'assistant' && (
              <AssistantChat
                airQuality={airQuality}
                recommendations={recommendations}
              />
            )}
          </>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-slate-600">
              Initializing AeroWise Environmental Action Engine...
            </p>
          </div>
        )}
      </main>

      {/* Modals */}
      <CitySearchModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        onSelectLocation={handleSelectLocation}
        currentLocation={location}
      />

      <DemoScenarioSelector
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectScenario={handleSelectScenario}
        activeScenarioId={activeDemoScenario?.id}
        isDemoMode={isDemoMode}
        onExitDemo={handleExitDemo}
      />

      {/* Responsible Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">
                  AeroWise
                </span>
                <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium border border-teal-200">
                  Daily Air-Quality Action Planner
                </span>
              </div>
              <p className="text-slate-600 max-w-xl">
                Helping families and communities navigate severe winter smog and
                urban air pollution with practical, context-aware decisions.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium">
              <a
                href="https://app.cpcbccr.com/AQI_India/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
              >
                <span>CPCB National AQI Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-300">|</span>
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-700 inline-flex items-center gap-1"
              >
                <span>Open-Meteo & CAMS</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>
                Zero user tracking · No paid database · Household data stored
                locally in browser
              </span>
            </div>
            <div>
              <span>PromptWars Challenge 6: Urban Air Quality Assistant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
