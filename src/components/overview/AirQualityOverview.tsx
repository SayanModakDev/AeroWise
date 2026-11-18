'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ModelledAirQuality } from '@/types/air-quality';
import {
  CPCB_NAQI_CATEGORIES,
  CPCB_OFFICIAL_PORTAL_URL,
  CPCB_REGULATORY_DISCLAIMER,
} from '@/lib/air-quality/cpcb-reference';
import { TrendChart } from './TrendChart';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface AirQualityOverviewProps {
  airQuality: ModelledAirQuality;
  isDemoMode: boolean;
}

export function AirQualityOverview({
  airQuality,
  isDemoMode,
}: AirQualityOverviewProps) {
  const [showCpcbTable, setShowCpcbTable] = useState(false);
  const { current, location, trend, daily24hMean, whoComparison } = airQuality;

  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-rose-600" />;
      case 'falling':
        return <TrendingDown className="w-4 h-4 text-emerald-600" />;
      default:
        return <Minus className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPm25SeverityClass = (val: number | null) => {
    if (val === null) return 'text-slate-500';
    if (val > 250) return 'text-rose-700';
    if (val > 120) return 'text-rose-600';
    if (val > 60) return 'text-amber-600';
    if (val > 30) return 'text-lime-600';
    return 'text-emerald-600';
  };

  return (
    <div className="space-y-6">
      {/* Statutory & Model Notice Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-800 text-teal-400 rounded-xl shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm sm:text-base text-slate-100">
                  Modelled Atmospheric Forecast Data
                </span>
                <span className="bg-slate-800 text-slate-300 text-[11px] px-2 py-0.5 rounded font-mono">
                  CAMS Global (~45 km resolution)
                </span>
                {isDemoMode && (
                  <span className="bg-amber-400 text-amber-950 font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                    Demonstration Values
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Values displayed are numerical atmospheric model estimates,{' '}
                <strong className="text-slate-200">
                  NOT validated government monitoring-station measurements
                </strong>
                . For statutory regulatory AQI and emergency alerts in India,
                consult the official Central Pollution Control Board (CPCB) portal.
              </p>
            </div>
          </div>

          <a
            href={CPCB_OFFICIAL_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shrink-0 shadow-xs"
          >
            <span>Official CPCB AQI Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: PM2.5 */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider">
                Modelled PM2.5
              </span>
              <Badge variant="danger" size="sm">
                Fine Particles
              </Badge>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono ${getPm25SeverityClass(
                  current.pm2_5
                )}`}
              >
                {current.pm2_5 !== null ? current.pm2_5 : 'N/A'}
              </span>
              <span className="text-xs font-semibold text-slate-500">µg/m³</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {whoComparison.pm25Ratio ? (
              <span className="font-medium text-rose-600">
                {whoComparison.pm25Ratio}× WHO 24h Guideline (15 µg/m³)
              </span>
            ) : (
              'Reference: WHO 24h Limit = 15 µg/m³'
            )}
          </div>
        </Card>

        {/* Card 2: PM10 */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider">
                Modelled PM10
              </span>
              <Badge variant="warning" size="sm">
                Coarse Dust
              </Badge>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-slate-900">
                {current.pm10 !== null ? current.pm10 : 'N/A'}
              </span>
              <span className="text-xs font-semibold text-slate-500">µg/m³</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {whoComparison.pm10Ratio ? (
              <span className="font-medium text-amber-600">
                {whoComparison.pm10Ratio}× WHO 24h Guideline (45 µg/m³)
              </span>
            ) : (
              'Reference: WHO 24h Limit = 45 µg/m³'
            )}
          </div>
        </Card>

        {/* Card 3: 24h Modelled Mean */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider">
                24h Modelled Mean
              </span>
              <Badge variant="neutral" size="sm">
                Forecast Window
              </Badge>
            </div>
            <div className="mt-2">
              {daily24hMean.adequateObservations ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-slate-900">
                    {daily24hMean.pm2_5 ?? '—'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    µg/m³ avg
                  </span>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic mt-2">
                  Insufficient continuous hours (&lt;18) for valid 24h mean.
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {daily24hMean.adequateObservations
              ? `Based on ${daily24hMean.observationCount} valid hourly model points.`
              : 'Requires minimum 18 hourly observations.'}
          </div>
        </Card>

        {/* Card 4: Forecast Trend */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold uppercase tracking-wider">
                Pollution Trend
              </span>
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className="capitalize font-semibold text-xs text-slate-700">
                  {trend.direction}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-700 font-medium mt-2 leading-relaxed">
              {trend.description}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {trend.troughHour ? (
              <span>
                Lower exposure window:~
                {new Date(trend.troughHour).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            ) : (
              'Monitor hourly changes'
            )}
          </div>
        </Card>
      </div>

      {/* WHO 2021 Reference Benchmark Explainer */}
      <Card className="bg-emerald-50/50 border-emerald-200/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                WHO 2021 Global Air Quality Guidelines Reference
              </h3>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {whoComparison.statusText}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Benchmarks: 24h PM2.5 limit is 15 µg/m³; PM10 is 45 µg/m³. These
                are scientific health reference benchmarks, not statutory limits or
                substitutes for local regulatory AQI.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Visual Pollutant Trend Chart */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              3-Day Particulate Concentration Forecast
            </h3>
            <p className="text-xs text-slate-500">
              Modelled hourly curve for {location.name}, {location.country}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                Data Time:{' '}
                {new Date(current.dataTimestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="font-mono">
              Retrieved:{' '}
              {new Date(airQuality.retrievalTimestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>

        <TrendChart
          hourly={airQuality.hourly}
          troughHour={trend.troughHour}
          peakHour={trend.peakHour}
        />
      </Card>

      {/* Expandable CPCB Regulatory Reference Table */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs">
        <button
          onClick={() => setShowCpcbTable(!showCpcbTable)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs sm:text-sm font-semibold text-slate-800">
              Understanding India&apos;s CPCB National AQI (Regulatory Reference)
            </span>
          </div>
          {showCpcbTable ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showCpcbTable && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              {CPCB_REGULATORY_DISCLAIMER}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse bg-white rounded-lg overflow-hidden border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">CPCB AQI Range</th>
                    <th className="p-2.5">PM2.5 (24h avg)</th>
                    <th className="p-2.5">PM10 (24h avg)</th>
                    <th className="p-2.5">Official Health Advisory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CPCB_NAQI_CATEGORIES.map((c) => (
                    <tr key={c.category} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-bold">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full mr-1.5"
                          style={{ backgroundColor: c.color }}
                        ></span>
                        {c.category}
                      </td>
                      <td className="p-2.5 font-mono">{c.aqiRange}</td>
                      <td className="p-2.5 font-mono">{c.pm25_24h_range} µg/m³</td>
                      <td className="p-2.5 font-mono">{c.pm10_24h_range} µg/m³</td>
                      <td className="p-2.5 text-slate-600">{c.healthAdvisory}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
              <span>
                Note: CPCB AQI calculation requires at least 3 monitored
                pollutants (with PM10 or PM2.5 mandatory) and ≥ 16 hours of
                continuous monitoring.
              </span>
              <a
                href={CPCB_OFFICIAL_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 font-semibold hover:underline inline-flex items-center gap-1 shrink-0"
              >
                Open Official CPCB Station Map <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
