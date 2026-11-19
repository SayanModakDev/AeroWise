import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callGeminiAssistant } from '@/lib/assistant/gemini';
import { AssistantEnvironmentalContext } from '@/types/assistant';

// Mock @google/genai module
vi.mock('@google/genai', () => {
  const mockGenerateContent = vi.fn();
  return {
    GoogleGenAI: vi.fn().mockImplementation((config: { apiKey: string }) => ({
      apiKey: config.apiKey,
      models: {
        generateContent: mockGenerateContent,
      },
    })),
    __mockGenerateContent: mockGenerateContent,
  };
});

// Import the mocked generateContent to inspect calls
import * as genAiModule from '@google/genai';

const mockEnv: AssistantEnvironmentalContext = {
  city: 'New Delhi',
  country: 'India',
  currentPm25: 180,
  currentPm10: 270,
  trendDirection: 'rising',
  whoPm25Ratio: 12.0,
};

const mockTopActions = [
  {
    title: 'Shift Outdoor Errands to Lower-Pollution Afternoon Hours',
    category: 'protect_household',
    whatToDo: 'Postpone outdoor tasks away from morning rush.',
  },
];

describe('@google/genai SDK Integration & Fallback', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns null and does not instantiate SDK if GEMINI_API_KEY is not set', async () => {
    delete process.env.GEMINI_API_KEY;

    const result = await callGeminiAssistant({
      message: 'Can I exercise outdoors today?',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).toBeNull();
    expect(genAiModule.GoogleGenAI).not.toHaveBeenCalled();
  });

  it('invokes generateContent with default gemini-3.8-flash and returns grounded reply', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';
    delete process.env.GEMINI_MODEL; // Should default to gemini-3.8-flash

    // Configure mock return
    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockResolvedValueOnce({
      text: 'Based on current conditions in New Delhi, postpone outdoor workouts until afternoon.',
    });

    const result = await callGeminiAssistant({
      message: 'Can I exercise outdoors today?',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).not.toBeNull();
    expect(result?.reply).toContain('New Delhi');
    expect(result?.groundingFacts.length).toBeGreaterThan(0);

    // Verify generateContent was called with gemini-3.8-flash
    expect(mockGen).toHaveBeenCalledTimes(1);
    const callArgs = mockGen.mock.calls[0][0];
    expect(callArgs.model).toBe('gemini-3.8-flash');
    expect(callArgs.config.temperature).toBe(0.3);
    expect(callArgs.config.systemInstruction).toContain('AeroWise Assistant');
  });

  it('uses custom GEMINI_MODEL when configured in environment', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';
    process.env.GEMINI_MODEL = 'gemini-2.5-pro';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockResolvedValueOnce({
      text: 'Response from custom configured model.',
    });

    const result = await callGeminiAssistant({
      message: 'What about indoor filters?',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).not.toBeNull();
    expect(mockGen).toHaveBeenCalledTimes(1);
    const callArgs = mockGen.mock.calls[0][0];
    expect(callArgs.model).toBe('gemini-2.5-pro');
  });

  it('gracefully handles API errors (e.g. rate limit, quota exhaustion, network abort) by returning null for fallback', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockRejectedValueOnce(new Error('429 Resource has been exhausted (e.g. check quota)'));

    const result = await callGeminiAssistant({
      message: 'How to clean air without purifier?',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    // Must return null without throwing exception
    expect(result).toBeNull();
  });

  it('returns null if model returns empty or whitespace-only response', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockResolvedValueOnce({
      text: '   ',
    });

    const result = await callGeminiAssistant({
      message: 'Hello?',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).toBeNull();
  });
});
