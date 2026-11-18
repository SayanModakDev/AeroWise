'use client';

import React from 'react';
import {
  ShieldAlert,
  Flame,
  AlertTriangle,
  Sparkles,
  Info,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { HouseholdProfile } from '@/types/household';
import { ModelledAirQuality } from '@/types/air-quality';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface IndoorAirGuardianProps {
  profile: HouseholdProfile;
  airQuality?: ModelledAirQuality;
  onNavigateToHousehold: () => void;
}

interface DetectedIssue {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'good';
  sourceName: string;
  whyItMatters: string;
  whatToChange: string;
  freeAlternative: string;
  safetyConsideration: string;
}

export function IndoorAirGuardian({
  profile,
  airQuality,
  onNavigateToHousehold,
}: IndoorAirGuardianProps) {
  const issues: DetectedIssue[] = [];

  // Issue 1: Solid Fuel / Biomass
  if (
    profile.cookingFuel === 'biomass_wood_coal' ||
    profile.cookingFuel === 'kerosene'
  ) {
    issues.push({
      id: 'solid_fuel',
      title: 'Solid Fuel / Biomass Cookstove in Living Quarters',
      severity: 'critical',
      sourceName:
        profile.cookingFuel === 'biomass_wood_coal'
          ? 'Firewood / Dung / Coal Chulha'
          : 'Kerosene Cooker',
      whyItMatters:
        'Incomplete combustion of solid biomass releases dense concentrations of PM2.5, carbon monoxide, polycyclic aromatic hydrocarbons, and black carbon directly into indoor breathing air. A traditional chulha produces particulate levels exceeding severe ambient smog by 10- to 20-fold.',
      whatToChange:
        'Transition to an LPG gas cylinder or an electric induction cooktop. Never cook with solid biomass in an enclosed room where family members sleep.',
      freeAlternative:
        'If solid fuel is currently unavoidable, shift cooking outdoors to a sheltered open-air courtyard or breezeway, and ensure children stay at least 5 meters downwind.',
      safetyConsideration:
        'Ensure continuous cross-draft when burning any solid fuel to prevent fatal nocturnal carbon monoxide (CO) buildup.',
    });
  }

  // Issue 2: Incense or Mosquito Coils
  if (profile.usesIncenseOrMosquitoCoils) {
    issues.push({
      id: 'incense_coils',
      title: 'Combustion from Incense Sticks & Smouldering Mosquito Coils',
      severity: 'critical',
      sourceName: 'Indoor Agarbatti & Mosquito Coils',
      whyItMatters:
        'Burning one mosquito coil produces particulate emissions equivalent to 75–100 cigarettes. Incense sticks emit high concentrations of volatile organic compounds (benzene, toluene) and ultrafine respirable soot particles right inside bedrooms.',
      whatToChange:
        'Immediately extinguish indoor incense and smouldering coils. Avoid scented candles and aerosol room fresheners.',
      freeAlternative:
        'Install tightly fitted physical window wire mesh, sleep under physical mosquito bed nets (100% free chemical-free protection), or use non-burning electric liquid vaporizers if necessary.',
      safetyConsideration:
        'Smouldering coils and unattended incense embers present a significant domestic fire risk near curtains and bedding.',
    });
  }

  // Issue 3: Indoor Smoking
  if (profile.hasIndoorSmoking) {
    issues.push({
      id: 'indoor_smoking',
      title: 'Indoor Tobacco Smoke Exposure (Secondhand Smoke)',
      severity: 'critical',
      sourceName: 'Cigarettes / Bidis',
      whyItMatters:
        'Secondhand and thirdhand tobacco smoke contains over 7,000 chemicals, including 70 known carcinogens. Particulate matter from indoor smoking adheres to walls, carpets, and upholstery, re-emitting toxic gases for months.',
      whatToChange:
        'Declare your home an absolute 100% smoke-free zone. Never permit smoking in bedrooms, balconies, or adjoining bathrooms.',
      freeAlternative:
        'Enforce a strict outdoor-only policy away from shared building entrances and open windows.',
      safetyConsideration:
        'Infants exposed to secondhand tobacco smoke face significantly increased risk of sudden infant death syndrome (SIDS) and chronic asthma.',
    });
  }

  // Issue 4: Cooking Ventilation
  if (
    profile.cookingVentilation === 'window_only' ||
    profile.cookingVentilation === 'poor_none'
  ) {
    issues.push({
      id: 'cooking_vent',
      title: 'Inadequate Kitchen Mechanical Exhaust Ventilation',
      severity: 'high',
      sourceName: 'Culinary Fumes & Oil Aerosols',
      whyItMatters:
        'Deep frying, high-heat tadka (tempering with mustard seeds and spices), and burning cooking oils release massive clouds of ultrafine particles and acrolein. Without mechanical extraction, these aerosols migrate across bedrooms and linger for up to 6 hours.',
      whatToChange:
        'Install an electric kitchen chimney or a wall-mounted exhaust fan directly adjacent to the cooking stove.',
      freeAlternative:
        'Close doors connecting the kitchen to bedrooms and living spaces while cooking. Open the kitchen window outward, cover frying pans with lids to trap oil splatter, and wipe stovetop surfaces immediately.',
      safetyConsideration:
        'Do not seal the kitchen airtight without a dedicated exhaust path while gas burners are running, as open flames consume oxygen and produce nitrogen dioxide (NO2).',
    });
  }

  // Issue 5: Dry Sweeping vs Wet Mopping (Universal recommendation)
  issues.push({
    id: 'dry_sweeping',
    title: 'Floor Dust Resuspension from Dry Broom Sweeping (Jhadu)',
    severity: 'medium',
    sourceName: 'Dry Sweeping & Duster Usage',
    whyItMatters:
      'Dry straw brooms (jhadu) and feather dusters mechanically resuspend heavy settled particles, road dust, and microscopic tire debris directly into breathing zones, creating sharp indoor particulate spikes lasting over 45 minutes.',
    whatToChange:
      'Replace dry sweeping with damp microfiber mopping. Vacuum only if your vacuum cleaner has a certified HEPA exhaust filter.',
    freeAlternative:
      'Wipe floors and window sills with a damp cotton cloth or water-wrung mop daily. Clean water traps particles rather than tossing them into the air.',
    safetyConsideration:
      'Wring mop thoroughly to prevent standing water, which could lead to fungal mould spores and slip hazards.',
  });

  // Issue 6: AC Mode
  if (profile.hasAcWithRecirculation) {
    issues.push({
      id: 'ac_recirculation',
      title: 'Air Conditioner Outdoor Air Infiltration Risk',
      severity: 'medium',
      sourceName: 'Split / Window AC Intake',
      whyItMatters:
        'Standard ACs set to fresh-air intake continuously draw unbuffered outdoor smog, soot, and traffic exhaust into your climate-controlled bedroom.',
      whatToChange:
        'Verify your AC remote control is locked into internal recirculation mode (recirculating loop icon).',
      freeAlternative:
        'Wash and dry the plastic mesh filters every 2 weeks to maintain airflow efficiency and prevent dust restriction.',
      safetyConsideration:
        'Standard mesh filters do not capture sub-micron PM2.5. Do not assume an AC replaces a dedicated mechanical air purifier.',
    });
  }

  // Issue 7: Purifier Guidance
  if (!profile.hasAirPurifier) {
    issues.push({
      id: 'purifier_guidance',
      title: 'Air Purifier Absence: Focus on Zero-Cost Source Elimination',
      severity: 'medium',
      sourceName: 'Lack of Mechanical Filtration',
      whyItMatters:
        'When ambient outdoor PM2.5 is severe, ambient air infiltrates through doors and windows. However, buying an expensive air purifier is not viable for all budgets.',
      whatToChange:
        'Create a clean "Refuge Room" (primary bedroom): seal gaps under doors with damp rolled towels, eliminate all burning sources, and keep doors shut.',
      freeAlternative:
        '100% free: Seal drafts, wet mop floors, eliminate incense and smoke, and maintain kitchen door separation.',
      safetyConsideration:
        'Avoid cheap ionizer or "plasma" air purifiers that generate ozone gas. Ozone is a toxic lung irritant that exacerbates asthma.',
    });
  }

  const criticalCount = issues.filter((i) => i.severity === 'critical').length;
  const highCount = issues.filter((i) => i.severity === 'high').length;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="bg-slate-900 text-white border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold text-white">
                Indoor Air Guardian Assessment
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Indoor air quality is often 2 to 5 times more polluted than outdoor
              air due to trapped cooking aerosols, incense burning, and resuspended
              floor dust. Current outdoor modelled PM2.5 in {airQuality?.location.name || 'your area'} is{' '}
              <strong className="text-teal-300 font-mono">
                {airQuality?.current.pm2_5 ?? '—'} µg/m³
              </strong>
              . Here is your personalized household indoor audit.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {criticalCount > 0 && (
              <div className="text-right">
                <div className="text-2xl font-extrabold text-rose-400 font-mono">
                  {criticalCount}
                </div>
                <div className="text-[11px] text-rose-300 uppercase tracking-wider font-semibold">
                  Critical Sources
                </div>
              </div>
            )}
            {highCount > 0 && (
              <div className="text-right">
                <div className="text-2xl font-extrabold text-amber-400 font-mono">
                  {highCount}
                </div>
                <div className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold">
                  High Impact
                </div>
              </div>
            )}
            <div className="text-right">
              <div className="text-2xl font-extrabold text-slate-300 font-mono">
                {issues.length}
              </div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Total Audited
              </div>
            </div>
            <button
              onClick={onNavigateToHousehold}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Update Profile
            </button>
          </div>
        </div>
      </Card>

      {/* Identified Issues List */}
      <div className="space-y-4">
        {issues.map((issue) => {
          const isCritical = issue.severity === 'critical';
          const isHigh = issue.severity === 'high';

          return (
            <Card
              key={issue.id}
              className={`space-y-4 border transition-all ${
                isCritical
                  ? 'border-rose-300 bg-rose-50/20'
                  : isHigh
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      isCritical
                        ? 'bg-rose-100 text-rose-800'
                        : isHigh
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isCritical ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Flame className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {issue.title}
                    </h3>
                    <span className="text-xs text-slate-500">
                      Source: {issue.sourceName}
                    </span>
                  </div>
                </div>

                <Badge
                  variant={isCritical ? 'danger' : isHigh ? 'warning' : 'neutral'}
                  size="sm"
                >
                  {isCritical ? 'Critical Source' : isHigh ? 'High Impact' : 'Preventative Practice'}
                </Badge>
              </div>

              {/* Four pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Why it matters */}
                <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    <span>Why It Matters</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {issue.whyItMatters}
                  </p>
                </div>

                {/* 2. What to change */}
                <div className="p-3 bg-white/80 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-teal-900">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>What to Change</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {issue.whatToChange}
                  </p>
                </div>

                {/* 3. Free or Affordable Alternative */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Free or Low-Cost Alternative</span>
                  </div>
                  <p className="text-emerald-950 leading-relaxed">
                    {issue.freeAlternative}
                  </p>
                </div>

                {/* 4. Safety Considerations */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                    <span>Safety Note</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {issue.safetyConsideration}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
