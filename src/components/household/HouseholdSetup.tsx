'use client';

import React, { useState } from 'react';
import {
  Users,
  Flame,
  Activity,
  Car,
  RotateCcw,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  BudgetTier,
  CookingFuel,
  CookingVentilation,
  DailyRoutine,
  HouseholdProfile,
  PrimaryTransport,
} from '@/types/household';
import { Card } from '../ui/Card';

interface HouseholdSetupProps {
  profile: HouseholdProfile;
  onUpdateProfile: (updated: HouseholdProfile) => void;
  onResetProfile: () => void;
}

export function HouseholdSetup({
  profile,
  onUpdateProfile,
  onResetProfile,
}: HouseholdSetupProps) {
  const [saveToast, setSaveToast] = useState(false);

  const updateField = <K extends keyof HouseholdProfile>(
    key: K,
    value: HouseholdProfile[K]
  ) => {
    const updated = { ...profile, [key]: value };
    onUpdateProfile(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Banner */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-teal-100 text-teal-800 rounded-xl shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Local Browser Privacy Guaranteed
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Your household composition, fuel choices, and health sensitivity
              flags are stored <strong className="text-teal-900">strictly on your device (localStorage)</strong>.
              They are never uploaded, logged on servers, or shared with Google Gemini.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {saveToast && (
            <span className="text-xs font-semibold text-teal-700 flex items-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" /> Saved locally
            </span>
          )}
          <button
            onClick={() => {
              if (
                window.confirm(
                  'Reset all household preferences back to standard defaults?'
                )
              ) {
                onResetProfile();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Setup</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: HOUSEHOLD COMPOSITION */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Users className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              1. Household Composition
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Select vulnerable family members living with you to heighten protective exposure rules.
          </p>

          <div className="space-y-2.5">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={profile.hasYoungChildren}
                onChange={(e) => updateField('hasYoungChildren', e.target.checked)}
                className="mt-1 rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 block">
                  Young Children (Under 5 years)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Higher minute-ventilation and developing lung alveoli; height at vehicle exhaust levels.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={profile.hasOlderAdults}
                onChange={(e) => updateField('hasOlderAdults', e.target.checked)}
                className="mt-1 rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 block">
                  Older Adults (65+ years)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Susceptible to microvascular inflammation and cardiovascular strain during acute smog spikes.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={profile.hasPregnantMember}
                onChange={(e) => updateField('hasPregnantMember', e.target.checked)}
                className="mt-1 rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 block">
                  Pregnant Household Member
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Elevated particulate exposure is linked to fetal growth restriction and maternal blood pressure spikes.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={profile.hasRespiratoryCardioVulnerability}
                onChange={(e) =>
                  updateField(
                    'hasRespiratoryCardioVulnerability',
                    e.target.checked
                  )
                }
                className="mt-1 rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 block">
                  Respiratory or Cardiovascular Conditions (Asthma / COPD / Heart)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Prioritizes non-strenuous routines, medication vigilance, and indoor refuge protocols.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* SECTION 2: HOME ENVIRONMENT & SOURCES */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Flame className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              2. Home Environment & Indoor Sources
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Primary Cooking Fuel
              </label>
              <select
                value={profile.cookingFuel}
                onChange={(e) =>
                  updateField('cookingFuel', e.target.value as CookingFuel)
                }
                className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-900"
              >
                <option value="lpg">LPG Cylinder / Piped Natural Gas (Clean)</option>
                <option value="electric">Electric / Induction Cooktop (Zero local emissions)</option>
                <option value="biomass_wood_coal">
                  Wood / Biomass / Coal / Dung Chulha (High emission hazard)
                </option>
                <option value="kerosene">Kerosene Stove</option>
                <option value="other">Other Solid Fuel</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Kitchen Cooking Ventilation
              </label>
              <select
                value={profile.cookingVentilation}
                onChange={(e) =>
                  updateField(
                    'cookingVentilation',
                    e.target.value as CookingVentilation
                  )
                }
                className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-900"
              >
                <option value="chimney_exhaust">Electric Kitchen Chimney (Duct outside)</option>
                <option value="exhaust_fan">Wall Exhaust Fan</option>
                <option value="window_only">Kitchen Window Only (Passive)</option>
                <option value="poor_none">Poor / No Kitchen Ventilation</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <span className="text-xs text-slate-700">
                  Indoor Incense (Agarbatti) or Mosquito Coils used
                </span>
                <input
                  type="checkbox"
                  checked={profile.usesIncenseOrMosquitoCoils}
                  onChange={(e) =>
                    updateField('usesIncenseOrMosquitoCoils', e.target.checked)
                  }
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <span className="text-xs text-slate-700">
                  Indoor Tobacco Smoking Exposure
                </span>
                <input
                  type="checkbox"
                  checked={profile.hasIndoorSmoking}
                  onChange={(e) =>
                    updateField('hasIndoorSmoking', e.target.checked)
                  }
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <span className="text-xs text-slate-700">
                  Air Purifier (HEPA) available in home
                </span>
                <input
                  type="checkbox"
                  checked={profile.hasAirPurifier}
                  onChange={(e) =>
                    updateField('hasAirPurifier', e.target.checked)
                  }
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <span className="text-xs text-slate-700">
                  Air Conditioner with Recirculation Mode
                </span>
                <input
                  type="checkbox"
                  checked={profile.hasAcWithRecirculation}
                  onChange={(e) =>
                    updateField('hasAcWithRecirculation', e.target.checked)
                  }
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </Card>

        {/* SECTION 3: DAILY LIFESTYLE & EXPOSURE */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              3. Daily Lifestyle & Routine
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Primary Daily Routine
              </label>
              <select
                value={profile.primaryRoutine}
                onChange={(e) =>
                  updateField('primaryRoutine', e.target.value as DailyRoutine)
                }
                className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-900"
              >
                <option value="office_commute">Daily Office / Commercial Commute</option>
                <option value="school_commute">School / College Commute</option>
                <option value="outdoor_worker">Outdoor / Field Work (Delivery, Construction, Sales)</option>
                <option value="work_from_home">Work from Home / Homemaker</option>
                <option value="regular_errands">Local Daily Errands & Domestic Work</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Daily Outdoor Exposure:</span>
                <span className="text-teal-700 font-bold font-mono">
                  {profile.dailyOutdoorHours} hours / day
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={profile.dailyOutdoorHours}
                onChange={(e) =>
                  updateField('dailyOutdoorHours', parseInt(e.target.value, 10))
                }
                className="w-full accent-teal-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0h (Mostly Indoors)</span>
                <span>6h</span>
                <span>12h+ (High Field Exposure)</span>
              </div>
            </div>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={profile.frequentOutdoorExercise}
                onChange={(e) =>
                  updateField('frequentOutdoorExercise', e.target.checked)
                }
                className="mt-1 rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 block">
                  Frequent Outdoor Exercise (Running, Jogging, Cycling)
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Enables exercise rescheduling and indoor workout substitution advice.
                </span>
              </div>
            </label>
          </div>
        </Card>

        {/* SECTION 4: TRANSPORT & CONSTRAINTS */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Car className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              4. Transport & Practical Constraints
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Primary Mode of Transport
              </label>
              <select
                value={profile.primaryTransport}
                onChange={(e) =>
                  updateField(
                    'primaryTransport',
                    e.target.value as PrimaryTransport
                  )
                }
                className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-900"
              >
                <option value="walking">Walking</option>
                <option value="bicycle">Bicycle</option>
                <option value="motorcycle">Motorcycle / Scooter (Two-Wheeler)</option>
                <option value="private_car">Private Car (Petrol / Diesel / CNG / EV)</option>
                <option value="bus">Public Bus</option>
                <option value="metro_rail">Metro Rail / Suburban Train</option>
                <option value="carpooling">Carpooling / Shared Ride</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Budget Flexibility Tier
              </label>
              <select
                value={profile.budgetTier}
                onChange={(e) =>
                  updateField('budgetTier', e.target.value as BudgetTier)
                }
                className="w-full text-xs sm:text-sm p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-900"
              >
                <option value="no_additional_budget">
                  No Additional Budget (Prioritize 100% Free Actions)
                </option>
                <option value="low_budget">
                  Low Budget (Affordable items like N95 masks, seals)
                </option>
                <option value="flexible_budget">
                  Flexible Budget (Air purifiers, induction cooktops, HVAC filters)
                </option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <span className="text-xs text-slate-700">
                  Limited or no nearby public transit access
                </span>
                <input
                  type="checkbox"
                  checked={profile.limitedPublicTransportAccess}
                  onChange={(e) =>
                    updateField(
                      'limitedPublicTransportAccess',
                      e.target.checked
                    )
                  }
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <span className="text-xs text-slate-700">
                  Inflexible work/school timings (cannot change travel hours)
                </span>
                <input
                  type="checkbox"
                  checked={profile.limitedTimingFlexibility}
                  onChange={(e) =>
                    updateField(
                      'limitedTimingFlexibility',
                      e.target.checked
                    )
                  }
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
