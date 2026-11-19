import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseAirQualityResponse,
  searchCities,
  fetchAirQuality,
} from '@/lib/air-quality/open-meteo';
import { GeoLocation } from '@/types/air-quality';
import { compareWithWhoGuidelines } from '@/lib/air-quality/who-guidelines';

const mockLocation: GeoLocation = {
  id: 1273294,
  name: 'New Delhi',
  country: 'India',
  countryCode: 'IN',
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 'Asia/Kolkata',
};

describe('Environmental Data Service & Normalization', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('correctly parses a valid Open-Meteo response structure', () => {
    const raw = {
      current: {
        time: '2026-11-18T10:00:00Z',
        pm2_5: 185.4,
        pm10: 290.2,
      },
      hourly: {
        time: [
          '2026-11-18T10:00:00Z',
          '2026-11-18T11:00:00Z',
          '2026-11-18T12:00:00Z',
          '2026-11-18T13:00:00Z',
        ],
        pm2_5: [185.4, 170.2, 160.1, 140.5],
        pm10: [290.2, 280.0, 260.4, 230.1],
      },
    };

    const parsed = parseAirQualityResponse(raw, mockLocation);

    expect(parsed.current.pm2_5).toBe(185.4);
    expect(parsed.current.pm10).toBe(290.2);
    expect(parsed.location.name).toBe('New Delhi');
    expect(parsed.hourly.length).toBe(4);
    expect(parsed.hourly[0].pm2_5).toBe(185.4);
    expect(parsed.modelInfo.name).toContain('CAMS Global');
  });

  it('never silently replaces null or missing readings with zero', () => {
    const rawWithNulls = {
      current: {
        time: '2026-11-18T10:00:00Z',
        pm2_5: null,
        pm10: null,
      },
      hourly: {
        time: ['2026-11-18T10:00:00Z'],
        pm2_5: [null],
        pm10: [null],
      },
    };

    const parsed = parseAirQualityResponse(rawWithNulls, mockLocation);

    expect(parsed.current.pm2_5).toBeNull();
    expect(parsed.current.pm10).toBeNull();
    expect(parsed.current.pm2_5).not.toBe(0);
    expect(parsed.hourly[0].pm2_5).toBeNull();
    expect(parsed.hourly[0].pm2_5).not.toBe(0);
  });

  it('calculates 24-hour modelled mean ONLY when adequate observations (>= 18 hours) are present', () => {
    // 12 hours only: inadequate
    const times12: string[] = [];
    const pm25_12: number[] = [];
    const pm10_12: number[] = [];
    for (let i = 0; i < 12; i++) {
      times12.push(`2026-11-18T${String(i).padStart(2, '0')}:00:00Z`);
      pm25_12.push(100);
      pm10_12.push(150);
    }

    const parsed12 = parseAirQualityResponse(
      {
        current: { time: '2026-11-18T00:00:00Z', pm2_5: 100, pm10: 150 },
        hourly: { time: times12, pm2_5: pm25_12, pm10: pm10_12 },
      },
      mockLocation
    );

    expect(parsed12.daily24hMean.adequateObservations).toBe(false);
    expect(parsed12.daily24hMean.pm2_5).toBeNull();

    // 24 hours: adequate
    const times24: string[] = [];
    const pm25_24: number[] = [];
    const pm10_24: number[] = [];
    for (let i = 0; i < 24; i++) {
      times24.push(`2026-11-18T${String(i).padStart(2, '0')}:00:00Z`);
      pm25_24.push(120);
      pm10_24.push(200);
    }

    const parsed24 = parseAirQualityResponse(
      {
        current: { time: '2026-11-18T00:00:00Z', pm2_5: 120, pm10: 200 },
        hourly: { time: times24, pm2_5: pm25_24, pm10: pm10_24 },
      },
      mockLocation
    );

    expect(parsed24.daily24hMean.adequateObservations).toBe(true);
    expect(parsed24.daily24hMean.pm2_5).toBe(120);
    expect(parsed24.daily24hMean.pm10).toBe(200);
  });

  it('keeps forecast data timestamp separate from application retrieval timestamp', () => {
    const modelTime = '2026-11-18T06:00:00Z';
    const parsed = parseAirQualityResponse(
      {
        current: { time: modelTime, pm2_5: 80, pm10: 140 },
        hourly: { time: [], pm2_5: [], pm10: [] },
      },
      mockLocation
    );

    expect(parsed.current.dataTimestamp).toBe(modelTime);
    expect(parsed.retrievalTimestamp).toBeDefined();
    expect(typeof parsed.retrievalTimestamp).toBe('string');
  });

  it('compares correctly against WHO 2021 24h health reference guidelines', () => {
    const cleanAir = compareWithWhoGuidelines(10, 30);
    expect(cleanAir.isExceeding).toBe(false);
    expect(cleanAir.pm25Ratio).toBe(0.7);

    const pollutedAir = compareWithWhoGuidelines(150, 300);
    expect(pollutedAir.isExceeding).toBe(true);
    expect(pollutedAir.pm25Ratio).toBe(10.0);
    expect(pollutedAir.pm10Ratio).toBe(6.7);
    expect(pollutedAir.statusText).toContain('10× the WHO 24h health reference guideline');
  });

  it('searchCities returns empty array for queries under 2 characters without network call', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');
    const resultEmpty = await searchCities('');
    const resultOneChar = await searchCities('a');

    expect(resultEmpty).toEqual([]);
    expect(resultOneChar).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('searchCities parses valid Open-Meteo geocoding response into GeoLocation list', async () => {
    const fakeGeocoding = {
      results: [
        {
          id: 1273294,
          name: 'Delhi',
          latitude: 28.65195,
          longitude: 77.23149,
          country: 'India',
          country_code: 'IN',
          admin1: 'Delhi',
          timezone: 'Asia/Kolkata',
        },
      ],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeGeocoding,
    }));

    const results = await searchCities('Delhi');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Delhi');
    expect(results[0].country).toBe('India');
    expect(results[0].countryCode).toBe('IN');
  });

  it('fetchAirQuality caches responses and avoids repeated network requests within TTL', async () => {
    const fakeApiResponse = {
      current: { time: '2026-11-18T10:00:00Z', pm2_5: 55, pm10: 95 },
      hourly: { time: ['2026-11-18T10:00:00Z'], pm2_5: [55], pm10: [95] },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeApiResponse,
    });
    vi.stubGlobal('fetch', fetchMock);

    const loc: GeoLocation = {
      id: 9999,
      name: 'Cache Test City',
      country: 'TestLand',
      countryCode: 'TL',
      latitude: 50.1234,
      longitude: 8.5678,
    };

    // First call: calls fetch
    const firstResult = await fetchAirQuality(loc);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(firstResult.current.pm2_5).toBe(55);

    // Second call: should retrieve from cache, not calling fetch again
    const secondResult = await fetchAirQuality(loc);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(secondResult.current.pm2_5).toBe(55);
  });

  it('fetchAirQuality handles API failure status cleanly by throwing informative error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    }));

    const loc: GeoLocation = {
      id: 8888,
      name: 'Error Test City',
      country: 'TestLand',
      countryCode: 'TL',
      latitude: 10.5,
      longitude: 20.5,
    };

    await expect(fetchAirQuality(loc, true)).rejects.toThrow('Air Quality API responded with status 503');
  });
});
