import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  callGeminiAssistant,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_MAX_OUTPUT_TOKENS,
} from '@/lib/assistant/gemini';
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
    ThinkingLevel: {
      THINKING_LEVEL_UNSPECIFIED: 'THINKING_LEVEL_UNSPECIFIED',
      MINIMAL: 'MINIMAL',
      LOW: 'LOW',
      MEDIUM: 'MEDIUM',
      HIGH: 'HIGH',
      XHIGH: 'XHIGH',
    },
    __mockGenerateContent: mockGenerateContent,
  };
});

// Import mocked generateContent
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

describe('@google/genai SDK Integration, Gemini 3.5 Flash-Lite & Response Completeness', () => {
  const originalEnv = { ...process.env };
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let infoSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.useRealTimers();
  });

  it('verifies default timeout constant is set to 20000ms and maxOutputTokens is 800', () => {
    expect(DEFAULT_TIMEOUT_MS).toBe(20000);
    expect(DEFAULT_MAX_OUTPUT_TOKENS).toBe(800);
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

  it('selects default model gemini-3.5-flash-lite when GEMINI_MODEL is missing', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';
    delete process.env.GEMINI_MODEL; // Default must be gemini-3.5-flash-lite

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockResolvedValueOnce({
      text: 'Response from default gemini-3.5-flash-lite model.',
      candidates: [{ finishReason: 'STOP' }],
      usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 30, totalTokenCount: 150 },
    });

    const result = await callGeminiAssistant({
      message: 'Can I exercise outdoors today?',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).not.toBeNull();
    expect(result?.reply).toContain('gemini-3.5-flash-lite');

    // Verify generateContent was called with gemini-3.5-flash-lite
    expect(mockGen).toHaveBeenCalledTimes(1);
    const callArgs = mockGen.mock.calls[0][0];
    expect(callArgs.model).toBe('gemini-3.5-flash-lite');
    expect(callArgs.config.thinkingConfig).toEqual({ thinkingLevel: 'LOW' });
    expect(callArgs.config.maxOutputTokens).toBe(800);
    expect(callArgs.config.abortSignal).toBeDefined();
    expect(callArgs.config.systemInstruction).toContain('AeroWise Assistant');

    // Verify safe diagnostic logging was called
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('Diagnostic - Model: gemini-3.5-flash-lite, FinishReason: STOP')
    );
  });

  it('honors GEMINI_MODEL environment-variable override', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';
    process.env.GEMINI_MODEL = 'gemini-2.5-pro';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockResolvedValueOnce({
      text: 'Response from custom configured model.',
      candidates: [{ finishReason: 'STOP' }],
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

  it('complete Gemini response ending with STOP returns full content and grounding facts', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockResolvedValueOnce({
      text: 'With current modelled PM2.5 at 180 µg/m³, morning outdoor exercise poses high respiratory exposure.\n\n1. Move workout indoors today.\n2. Keep windows sealed during inversion peaks.\n3. Exercise after 13:00 if outdoors.\n\nThese steps reduce direct alveolar particulate deposition.',
      candidates: [{ finishReason: 'STOP' }],
      usageMetadata: { promptTokenCount: 160, candidatesTokenCount: 65, totalTokenCount: 225 },
    });

    const result = await callGeminiAssistant({
      message: 'What are three recommendations for exercise?',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).not.toBeNull();
    expect(result?.reply).toContain('1. Move workout indoors today.');
    expect(result?.reply).toContain('2. Keep windows sealed during inversion peaks.');
    expect(result?.reply).toContain('3. Exercise after 13:00 if outdoors.');
    expect(result?.groundingFacts.length).toBeGreaterThan(0);
  });

  it('treats response ending with MAX_TOKENS as incomplete and returns null for local fallback', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    // Simulate generation truncated mid-sentence by token budget
    mockGen.mockResolvedValueOnce({
      text: "You don't need an expensive air purifier to protect your family indoors. With",
      candidates: [{ finishReason: 'MAX_TOKENS' }],
      usageMetadata: { promptTokenCount: 180, candidatesTokenCount: 400, totalTokenCount: 580 },
    });

    const result = await callGeminiAssistant({
      message: 'How to clean air without purifier?',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Incomplete response truncated by MAX_TOKENS ceiling')
    );
  });

  it('treats missing candidates as failure and returns null for local fallback', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockResolvedValueOnce({
      text: '',
      candidates: [],
    });

    const result = await callGeminiAssistant({
      message: 'Hello?',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('No candidate returned from model')
    );
  });

  it('treats safety-blocked response as failure and returns null for local fallback', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockResolvedValueOnce({
      text: '',
      candidates: [{ finishReason: 'SAFETY', finishMessage: 'Blocked due to health safety filters' }],
    });

    const result = await callGeminiAssistant({
      message: 'Prescribe medicine for cough',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Generation blocked by safety policy (FinishReason: SAFETY')
    );
  });

  it('treats recitation or policy block as failure and returns null', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockResolvedValueOnce({
      text: 'Some copyright content...',
      candidates: [{ finishReason: 'RECITATION' }],
    });

    const result = await callGeminiAssistant({
      message: 'Recite text',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Generation blocked by safety policy (FinishReason: RECITATION')
    );
  });

  it('treats other non-standard finish reasons as failure and returns null', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockResolvedValueOnce({
      text: 'Partial text before error',
      candidates: [{ finishReason: 'OTHER' }],
    });

    const result = await callGeminiAssistant({
      message: 'Trigger other finish reason',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Non-standard finish reason received (FinishReason: OTHER')
    );
  });

  it('returns null if model returns empty or whitespace-only response', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockResolvedValueOnce({
      text: '   ',
      candidates: [{ finishReason: 'STOP' }],
    });

    const result = await callGeminiAssistant({
      message: 'Hello?',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Empty or blank response')
    );
  });

  it('triggers fallback and returns null when request exceeds 20 seconds timeout', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';
    vi.useFakeTimers();

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockImplementationOnce(({ config }: { config: { abortSignal?: AbortSignal } }) => {
      return new Promise((resolve, reject) => {
        if (config?.abortSignal) {
          config.abortSignal.addEventListener('abort', () => {
            const abortErr = new Error('This operation was aborted (code 20)');
            abortErr.name = 'AbortError';
            reject(abortErr);
          });
        }
      });
    });

    const promise = callGeminiAssistant({
      message: 'Will this request time out?',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    await vi.advanceTimersByTimeAsync(20005);

    const result = await promise;
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Request timed out locally after')
    );
  });

  it('clears timeout after successful completion', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockResolvedValueOnce({
      text: 'Quick successful response',
      candidates: [{ finishReason: 'STOP' }],
    });

    await callGeminiAssistant({
      message: 'Test success timeout clearing',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('clears timeout in finally block after an error occurs', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockRejectedValueOnce(new Error('Simulated upstream failure'));

    await callGeminiAssistant({
      message: 'Test error timeout clearing',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('handles 400 bad request / unsupported parameter separately and falls back', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    const err = new Error('400 Invalid argument: unsupported parameter');
    (err as unknown as { status: number }).status = 400;
    mockGen.mockRejectedValueOnce(err);

    const result = await callGeminiAssistant({
      message: 'Checking 400 error',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Bad request or unsupported parameter (status 400)')
    );
  });

  it('handles invalid credentials (401/403) separately and falls back to local engine', async () => {
    process.env.GEMINI_API_KEY = 'invalid-api-key';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    const credError = new Error('API_KEY_INVALID: API key not valid. Please pass a valid API key.');
    (credError as unknown as { status: number }).status = 401;
    mockGen.mockRejectedValueOnce(credError);

    const result = await callGeminiAssistant({
      message: 'Checking auth failure',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Authentication or permission issue')
    );
  });

  it('handles model unavailable error (404) separately and falls back to local engine', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    const notFoundError = new Error('models/gemini-unavailable is not supported or not found');
    (notFoundError as unknown as { status: number }).status = 404;
    mockGen.mockRejectedValueOnce(notFoundError);

    const result = await callGeminiAssistant({
      message: 'Checking model 404',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('unavailable or not found (status 404)')
    );
  });

  it('handles rate limit / quota exhaustion (429) separately and falls back', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    const quotaError = new Error('429 Resource has been exhausted (check quota)');
    (quotaError as unknown as { status: number }).status = 429;
    mockGen.mockRejectedValueOnce(quotaError);

    const result = await callGeminiAssistant({
      message: 'Rate limit query',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Rate limit or quota exhausted (status 429)')
    );
  });

  it('handles 503 service unavailable / model temporarily overloaded separately and falls back', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    const overloadError = new Error('The model is overloaded. Please try again later.');
    (overloadError as unknown as { status: number }).status = 503;
    mockGen.mockRejectedValueOnce(overloadError);

    const result = await callGeminiAssistant({
      message: 'Model overloaded query',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Service unavailable or model temporarily overloaded (status 503)')
    );
  });

  it('handles network connectivity errors separately and falls back', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockRejectedValueOnce(new Error('fetch failed: getaddrinfo ENOTFOUND generativelanguage.googleapis.com'));

    const result = await callGeminiAssistant({
      message: 'Network offline test',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Network connectivity error')
    );
  });

  it('respects custom GEMINI_TIMEOUT_MS environment variable', async () => {
    process.env.GEMINI_API_KEY = 'test-key-valid';
    process.env.GEMINI_TIMEOUT_MS = '12000';
    vi.useFakeTimers();

    const mockGen = (genAiModule as unknown as { __mockGenerateContent: ReturnType<typeof vi.fn> }).__mockGenerateContent;
    mockGen.mockImplementationOnce(({ config }: { config: { abortSignal?: AbortSignal } }) => {
      return new Promise((resolve, reject) => {
        if (config?.abortSignal) {
          config.abortSignal.addEventListener('abort', () => {
            const abortErr = new Error('Aborted');
            abortErr.name = 'AbortError';
            reject(abortErr);
          });
        }
      });
    });

    const promise = callGeminiAssistant({
      message: 'Testing custom timeout threshold',
      environmentalContext: mockEnv,
      topActions: mockTopActions,
    });

    await vi.advanceTimersByTimeAsync(12005);

    const result = await promise;
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('timeout limit: 12000ms')
    );
  });
});
