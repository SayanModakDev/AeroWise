import { describe, it, expect } from 'vitest';
import { generateLocalFallbackResponse } from '@/lib/assistant/fallback';
import { AssistantEnvironmentalContext } from '@/types/assistant';

const mockEnv: AssistantEnvironmentalContext = {
  city: 'Kolkata',
  country: 'India',
  currentPm25: 145,
  currentPm10: 220,
  trendDirection: 'rising',
  whoPm25Ratio: 9.7,
};

const mockTopActions = [
  {
    title: 'Wear a Certified N95/FFP2 Particulate Respirator for Transit',
    category: 'protect_household',
    whatToDo: 'Use a well-fitted certified N95 or FFP2 particulate respirator.',
  },
  {
    title: 'Shift Outdoor Errands to Lower-Pollution Afternoon Hours',
    category: 'protect_household',
    whatToDo: 'Postpone non-essential outdoor errands away from morning rush.',
  },
];

describe('GenAI Assistant Grounding & Deterministic Fallback', () => {
  it('correctly addresses exercise queries with specific indoor alternatives and city grounding', () => {
    const res = generateLocalFallbackResponse(
      'Should I go for my morning jog today?',
      mockEnv,
      mockTopActions
    );

    expect(res.reply).toContain('Kolkata');
    expect(res.reply).toContain('145 µg/m³');
    expect(res.reply.toLowerCase()).toContain('indoor yoga');
    expect(res.reply.toLowerCase()).toContain('avoid outdoor cardio');
    expect(res.disclaimer).toContain('AeroWise Air-to-Action Engine (Local Fallback)');
    expect(res.groundingFacts.length).toBeGreaterThan(0);
  });

  it('correctly addresses purifier queries with free zero-cost alternatives', () => {
    const res = generateLocalFallbackResponse(
      'How to keep indoor air clean without buying an expensive purifier?',
      mockEnv,
      mockTopActions
    );

    expect(res.reply).toContain('Wet-mopping instead of sweeping');
    expect(res.reply).toContain('Eliminate burning sources');
    expect(res.reply).toContain('Kitchen exhaust discipline');
  });

  it('correctly provides protective guidance for vulnerable family members', () => {
    const res = generateLocalFallbackResponse(
      'How should I protect my young child with asthma today?',
      mockEnv,
      mockTopActions
    );

    expect(res.reply).toContain('Restrict morning outdoor play');
    expect(res.reply).toContain('Idle-Free school pickups');
    expect(res.reply).toContain('medical attention'); // safety guardrail
  });

  it('correctly grounds commuter transport questions', () => {
    const res = generateLocalFallbackResponse(
      'What are the best commute alternatives for severe smog?',
      mockEnv,
      mockTopActions
    );

    expect(res.reply).toContain('grade-separated');
    expect(res.reply).toContain('Two-wheeler protection');
    expect(res.reply).toContain('Trip chaining');
  });

  it('never outputs clinical diagnoses or changes to medical prescriptions', () => {
    const res = generateLocalFallbackResponse(
      'My chest hurts and I cannot breathe, what medication should I take?',
      mockEnv,
      mockTopActions
    );

    // Must not diagnose or prescribe medicine
    expect(res.reply).not.toContain('Take 500mg');
    expect(res.reply).not.toContain('Stop taking your');
    expect(res.disclaimer.toLowerCase()).toContain('not validated government monitoring stations');
  });
});
