export const WHO_2021_GUIDELINES = {
  DAILY_PM2_5: 15, // µg/m³ (24-hour mean)
  DAILY_PM10: 45, // µg/m³ (24-hour mean)
  ANNUAL_PM2_5: 5, // µg/m³ (annual mean)
  ANNUAL_PM10: 15, // µg/m³ (annual mean)
  REFERENCE_SOURCE: 'WHO Global Air Quality Guidelines (2021)',
  DISCLAIMER:
    'WHO guideline values represent public health benchmarks based on extensive epidemiological evidence. They are not legal emission limits or local safety guarantees.',
} as const;

export interface WhoComparisonResult {
  pm25Guideline: number;
  pm10Guideline: number;
  pm25Ratio: number | null;
  pm10Ratio: number | null;
  statusText: string;
  isExceeding: boolean;
}

export function compareWithWhoGuidelines(
  pm25: number | null,
  pm10: number | null
): WhoComparisonResult {
  const pm25Ratio =
    pm25 !== null && pm25 > 0
      ? Number((pm25 / WHO_2021_GUIDELINES.DAILY_PM2_5).toFixed(1))
      : null;

  const pm10Ratio =
    pm10 !== null && pm10 > 0
      ? Number((pm10 / WHO_2021_GUIDELINES.DAILY_PM10).toFixed(1))
      : null;

  let statusText = 'Within WHO 2021 24h health reference guidelines.';
  let isExceeding = false;

  if (pm25Ratio !== null && pm25Ratio > 1.0) {
    isExceeding = true;
    if (pm25Ratio > 10.0) {
      statusText = `Modelled PM2.5 is ${pm25Ratio}× the WHO 24h health reference guideline (${WHO_2021_GUIDELINES.DAILY_PM2_5} µg/m³). Severe chronic and acute health risks.`;
    } else if (pm25Ratio > 5.0) {
      statusText = `Modelled PM2.5 is ${pm25Ratio}× the WHO 24h health reference guideline (${WHO_2021_GUIDELINES.DAILY_PM2_5} µg/m³). High exposure risk for all individuals.`;
    } else {
      statusText = `Modelled PM2.5 is ${pm25Ratio}× the WHO 24h health reference guideline (${WHO_2021_GUIDELINES.DAILY_PM2_5} µg/m³). Elevated exposure risk, especially for vulnerable groups.`;
    }
  } else if (pm25 === null) {
    statusText = 'PM2.5 observations unavailable for WHO guideline comparison.';
  }

  return {
    pm25Guideline: WHO_2021_GUIDELINES.DAILY_PM2_5,
    pm10Guideline: WHO_2021_GUIDELINES.DAILY_PM10,
    pm25Ratio,
    pm10Ratio,
    statusText,
    isExceeding,
  };
}
