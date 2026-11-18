import { describe, it, expect } from 'vitest';
import {
  canCalculateOfficialCpcbAqi,
  CPCB_NAQI_CATEGORIES,
} from '@/lib/air-quality/cpcb-reference';

describe('AQI & Regulatory Reference Guardrails', () => {
  it('disallows generating official CPCB NAQI from atmospheric model forecast data', () => {
    const check = canCalculateOfficialCpcbAqi({
      pollutantCount: 4,
      hasPm25OrPm10: true,
      validMonitoredHours: 24,
      isOfficialStation: false, // Modelled forecast
    });

    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('Modelled forecast data cannot be used to generate official CPCB National AQI');
  });

  it('rejects generating CPCB National AQI from fewer than 3 pollutants', () => {
    const check = canCalculateOfficialCpcbAqi({
      pollutantCount: 1, // Single PM2.5
      hasPm25OrPm10: true,
      validMonitoredHours: 24,
      isOfficialStation: true,
    });

    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('requires monitoring of at least 3 pollutants');
  });

  it('rejects calculation if neither PM10 nor PM2.5 is present', () => {
    const check = canCalculateOfficialCpcbAqi({
      pollutantCount: 3, // e.g. NO2, SO2, CO only
      hasPm25OrPm10: false,
      validMonitoredHours: 24,
      isOfficialStation: true,
    });

    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('requires either PM10 or PM2.5 as a mandatory constituent');
  });

  it('rejects calculation if data completeness is under 16 hours', () => {
    const check = canCalculateOfficialCpcbAqi({
      pollutantCount: 4,
      hasPm25OrPm10: true,
      validMonitoredHours: 12, // Less than 16 hours
      isOfficialStation: true,
    });

    expect(check.allowed).toBe(false);
    expect(check.reason).toContain('at least 16 hours of continuous monitoring');
  });

  it('allows calculation ONLY when statutory government monitoring criteria are met', () => {
    const check = canCalculateOfficialCpcbAqi({
      pollutantCount: 5,
      hasPm25OrPm10: true,
      validMonitoredHours: 24,
      isOfficialStation: true,
    });

    expect(check.allowed).toBe(true);
  });

  it('verifies CPCB National AQI reference breakpoints table is complete and defined', () => {
    expect(CPCB_NAQI_CATEGORIES.length).toBe(6);
    const names = CPCB_NAQI_CATEGORIES.map((c) => c.category);
    expect(names).toEqual([
      'Good',
      'Satisfactory',
      'Moderate',
      'Poor',
      'Very Poor',
      'Severe',
    ]);
  });
});
