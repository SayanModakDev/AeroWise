'use client';

import React, { useState } from 'react';
import { HourlyForecastPoint } from '@/types/air-quality';
import { WHO_2021_GUIDELINES } from '@/lib/air-quality/who-guidelines';

interface TrendChartProps {
  hourly: HourlyForecastPoint[];
  troughHour?: string;
  peakHour?: string;
}

export function TrendChart({ hourly, troughHour, peakHour }: TrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Take next 48 hours for clean, readable layout
  const points = hourly.slice(0, 48);
  if (points.length < 6) {
    return (
      <div className="h-60 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
        Insufficient hourly forecast observations to render trend chart.
      </div>
    );
  }

  // Find max value for scaling
  let maxVal = 60; // minimum ceiling
  for (const p of points) {
    if (p.pm2_5 !== null && p.pm2_5 > maxVal) maxVal = p.pm2_5;
    if (p.pm10 !== null && p.pm10 > maxVal) maxVal = p.pm10;
  }
  // Add 15% headroom
  maxVal = Math.ceil((maxVal * 1.15) / 10) * 10;

  const width = 800;
  const height = 240;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (idx: number) => paddingLeft + (idx / (points.length - 1)) * chartW;
  const getY = (val: number | null) => {
    if (val === null) return paddingTop + chartH;
    const clamped = Math.max(0, Math.min(val, maxVal));
    return paddingTop + chartH - (clamped / maxVal) * chartH;
  };

  // Build SVG path for PM2.5
  const pm25Coords: [number, number][] = [];
  const pm10Coords: [number, number][] = [];

  points.forEach((p, idx) => {
    if (p.pm2_5 !== null) {
      pm25Coords.push([getX(idx), getY(p.pm2_5)]);
    }
    if (p.pm10 !== null) {
      pm10Coords.push([getX(idx), getY(p.pm10)]);
    }
  });

  const generateLinePath = (coords: [number, number][]) => {
    if (coords.length === 0) return '';
    return coords.reduce(
      (acc, [x, y], i) => (i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`),
      ''
    );
  };

  const generateAreaPath = (coords: [number, number][]) => {
    if (coords.length === 0) return '';
    const line = generateLinePath(coords);
    const firstX = coords[0][0];
    const lastX = coords[coords.length - 1][0];
    const zeroY = paddingTop + chartH;
    return `${line} L ${lastX} ${zeroY} L ${firstX} ${zeroY} Z`;
  };

  const pm25Path = generateLinePath(pm25Coords);
  const pm25Area = generateAreaPath(pm25Coords);
  const pm10Path = generateLinePath(pm10Coords);

  const whoPm25Y = getY(WHO_2021_GUIDELINES.DAILY_PM2_5);

  const hoveredPoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-3 h-1 bg-rose-600 rounded-full"></span>
            <span>PM2.5 (Fine Particulates)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-500">
            <span className="w-3 h-1 bg-amber-500 rounded-full"></span>
            <span>PM10 (Coarse Dust)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-3 h-0.5 border-t border-dashed border-emerald-600"></span>
            <span>WHO 24h Guideline (15 µg/m³)</span>
          </div>
        </div>

        {hoveredPoint && (
          <div className="bg-slate-900 text-white px-2.5 py-1 rounded text-xs font-mono shadow-sm">
            <span>
              {new Date(hoveredPoint.time).toLocaleTimeString([], {
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
              :
            </span>
            <span className="text-rose-400 font-bold ml-2">
              PM2.5: {hoveredPoint.pm2_5 ?? '—'} µg/m³
            </span>
            <span className="text-amber-400 ml-2">
              PM10: {hoveredPoint.pm10 ?? '—'} µg/m³
            </span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden bg-white rounded-xl border border-slate-200/90 p-2 sm:p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Grid lines and Y-axis ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const val = Math.round(maxVal * pct);
            const y = paddingTop + chartH - pct * chartH;
            return (
              <g key={pct}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* WHO Guideline Reference Line */}
          {whoPm25Y >= paddingTop && whoPm25Y <= paddingTop + chartH && (
            <g>
              <line
                x1={paddingLeft}
                y1={whoPm25Y}
                x2={width - paddingRight}
                y2={whoPm25Y}
                stroke="#059669"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={width - paddingRight}
                y={whoPm25Y - 4}
                textAnchor="end"
                fontSize="9"
                fill="#059669"
                fontWeight="bold"
              >
                WHO 24h Guideline (15 µg/m³)
              </text>
            </g>
          )}

          {/* Area under PM2.5 */}
          <path d={pm25Area} fill="url(#pm25Gradient)" opacity="0.18" />

          {/* PM10 line */}
          <path
            d={pm10Path}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* PM2.5 line */}
          <path
            d={pm25Path}
            fill="none"
            stroke="#e11d48"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e11d48" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Time axis ticks (every 6 hours) */}
          {points.map((p, idx) => {
            if (idx % 6 !== 0 && idx !== points.length - 1) return null;
            const x = getX(idx);
            const date = new Date(p.time);
            const label = date.toLocaleTimeString([], {
              weekday: idx === 0 ? 'short' : undefined,
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <g key={p.time}>
                <line
                  x1={x}
                  y1={paddingTop + chartH}
                  x2={x}
                  y2={paddingTop + chartH + 5}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={paddingTop + chartH + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#64748b"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {/* Hover indicator vertical bar */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={paddingTop}
                x2={getX(hoverIndex)}
                y2={paddingTop + chartH}
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              {points[hoverIndex].pm2_5 !== null && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(points[hoverIndex].pm2_5)}
                  r="4"
                  fill="#e11d48"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
            </g>
          )}

          {/* Transparent hit boxes for mouse movement */}
          {points.map((_, idx) => {
            const x = getX(idx);
            const stepW = chartW / (points.length - 1);
            return (
              <rect
                key={idx}
                x={x - stepW / 2}
                y={paddingTop}
                width={stepW}
                height={chartH}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-crosshair"
              />
            );
          })}
        </svg>

        <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Axes: Time (Next 48 Hours) vs Modelled (µg/m³)</span>
            {troughHour && (
              <span className="text-teal-700 font-medium">
                • Lowest Exposure Window:~
                {new Date(troughHour).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
            {peakHour && (
              <span className="text-rose-700 font-medium">
                • Projected Peak:~
                {new Date(peakHour).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>
          <span>Source: CAMS Atmospheric Model (~45 km grid cell via Open-Meteo)</span>
        </div>
      </div>
    </div>
  );
}
