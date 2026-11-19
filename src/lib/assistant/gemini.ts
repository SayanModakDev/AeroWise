import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  AssistantActionSummary,
  AssistantEnvironmentalContext,
} from '@/types/assistant';

const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
export const DEFAULT_TIMEOUT_MS = 20000;
export const DEFAULT_MAX_OUTPUT_TOKENS = 800;

export async function callGeminiAssistant(params: {
  message: string;
  environmentalContext: AssistantEnvironmentalContext;
  topActions: AssistantActionSummary[];
  history?: { role: 'user' | 'assistant'; content: string }[];
}): Promise<{
  reply: string;
  groundingFacts: string[];
} | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const parsedTimeout = process.env.GEMINI_TIMEOUT_MS
    ? parseInt(process.env.GEMINI_TIMEOUT_MS, 10)
    : NaN;
  const timeoutMs =
    !isNaN(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  let isLocalTimeout = false;
  let timeoutId: NodeJS.Timeout | null = null;
  const startTime = Date.now();

  try {
    timeoutId = setTimeout(() => {
      isLocalTimeout = true;
      controller.abort();
    }, timeoutMs);

    const ai = new GoogleGenAI({ apiKey });

    const groundingFacts = [
      `Location: ${params.environmentalContext.city}, ${params.environmentalContext.country}`,
      `Modelled PM2.5: ${params.environmentalContext.currentPm25 ?? 'Unavailable'} µg/m³`,
      `Modelled PM10: ${params.environmentalContext.currentPm10 ?? 'Unavailable'} µg/m³`,
      `Trend: ${params.environmentalContext.trendDirection}`,
      `WHO 2021 24h PM2.5 Reference: 15 µg/m³`,
      `Verified Action Candidates: ${params.topActions.map((a) => a.title).join('; ')}`,
    ];

    const systemInstruction = `You are AeroWise Assistant, an expert environmental-health and air quality action planner.
Your goal is to help families make practical, low-emission, exposure-reducing decisions during severe urban air pollution.

RESPONSE STRUCTURE & STYLE:
- Direct and actionable: Begin with a direct one-sentence explanation addressing the user's specific query.
- Three recommendations: When actionable steps or recommendations are requested, provide exactly three numbered practical recommendations (1., 2., 3.).
- Impact rationale: Explain briefly why the recommendations matter, distinguishing personal exposure protection from community emissions reduction.
- Safety & limitation: Include a short relevant safety or limitation note when necessary.
- Completeness: Always write complete grammatical sentences with proper sentence endings (periods, question marks). NEVER stop mid-sentence.
- Target length: Aim for approximately 80–140 words for ordinary environmental advice, adjusting to the question.
- Clean Markdown: Format cleanly using standard Markdown (**bold**, numbered lists, bullet points).

STRICT GROUNDING & SAFETY RULES:
1. ONLY refer to the supplied environmental facts and verified action candidates:
   - Location: ${params.environmentalContext.city}, ${params.environmentalContext.country}
   - Modelled PM2.5: ${params.environmentalContext.currentPm25 ?? 'N/A'} µg/m³ (from CAMS Global forecast, NOT an official regulatory monitoring station)
   - Modelled PM10: ${params.environmentalContext.currentPm10 ?? 'N/A'} µg/m³
   - Trend: ${params.environmentalContext.trendDirection}
   - Verified candidate actions from AeroWise Engine:
${params.topActions.map((a, i) => `     ${i + 1}. [${a.category}] ${a.title}: ${a.whatToDo}`).join('\n')}

2. NEVER invent live AQI numbers, monitoring stations, medical statistics, or health guarantees.
3. NEVER diagnose medical conditions or alter prescribed treatments. If a user mentions severe or worsening symptoms (e.g. chest pain, acute asthma attack), explicitly instruct them to seek urgent in-person medical care.
4. Distinguish modelled numerical forecasts from official regulatory government stations (like India's CPCB).
5. Explain exposure reduction vs emissions reduction clearly.
6. Provide free and low-cost practical solutions first.`;

    const contents: Array<{
      role: 'user' | 'model';
      parts: Array<{ text: string }>;
    }> = [];

    if (params.history && params.history.length > 0) {
      for (const h of params.history.slice(-4)) {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: params.message }],
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
        maxOutputTokens: DEFAULT_MAX_OUTPUT_TOKENS,
        abortSignal: controller.signal,
      },
    });

    const elapsedMs = Date.now() - startTime;

    // Inspect candidates, finishReason, and usage metrics
    const candidates = response.candidates;
    const primaryCandidate = candidates && candidates.length > 0 ? candidates[0] : undefined;
    const finishReason = primaryCandidate?.finishReason;
    const finishMessage = (primaryCandidate as { finishMessage?: string })?.finishMessage;
    const usage = response.usageMetadata;
    const promptTokens = usage?.promptTokenCount ?? 0;
    const candidateTokens = usage?.candidatesTokenCount ?? 0;
    const totalTokens = usage?.totalTokenCount ?? 0;
    const replyText = response.text;
    const charLength = replyText ? replyText.length : 0;

    // Safe diagnostic logging (no API keys, prompts, household PII, or raw personal data)
    console.info(
      `[Gemini Assistant] Diagnostic - Model: ${modelName}, FinishReason: ${finishReason || 'UNKNOWN'}, PromptTokens: ${promptTokens}, CandidateTokens: ${candidateTokens}, TotalTokens: ${totalTokens}, CharLength: ${charLength}, Duration: ${elapsedMs}ms`
    );

    // Validate candidate presence
    if (!primaryCandidate) {
      console.warn(
        `[Gemini Assistant] No candidate returned from model '${modelName}' (FinishReason: NONE, Duration: ${elapsedMs}ms). Falling back to local decision engine.`
      );
      return null;
    }

    // Treat responses ending with MAX_TOKENS as incomplete
    if (finishReason === 'MAX_TOKENS') {
      console.warn(
        `[Gemini Assistant] Incomplete response truncated by MAX_TOKENS ceiling (CandidateTokens: ${candidateTokens}, CharLength: ${charLength}, Duration: ${elapsedMs}ms). Discarding incomplete output and falling back to local decision engine.`
      );
      return null;
    }

    // Check for safety or policy blocking
    if (
      finishReason === 'SAFETY' ||
      finishReason === 'RECITATION' ||
      finishReason === 'BLOCKLIST' ||
      finishReason === 'PROHIBITED_CONTENT' ||
      finishReason === 'SPII'
    ) {
      console.warn(
        `[Gemini Assistant] Generation blocked by safety policy (FinishReason: ${finishReason}, Message: ${finishMessage || 'none'}, Duration: ${elapsedMs}ms). Falling back to local decision engine.`
      );
      return null;
    }

    // Check for other abnormal finish reasons
    if (finishReason !== 'STOP' && finishReason !== undefined) {
      console.warn(
        `[Gemini Assistant] Non-standard finish reason received (FinishReason: ${finishReason}, Message: ${finishMessage || 'none'}, Duration: ${elapsedMs}ms). Discarding potentially incomplete output and falling back to local decision engine.`
      );
      return null;
    }

    // Check for empty or blank text
    if (!replyText || replyText.trim() === '') {
      console.warn(
        `[Gemini Assistant] Empty or blank response received from model '${modelName}' (FinishReason: ${finishReason || 'STOP'}, Duration: ${elapsedMs}ms). Falling back to local decision engine.`
      );
      return null;
    }

    return {
      reply: replyText.trim(),
      groundingFacts,
    };
  } catch (error: unknown) {
    const elapsedMs = Date.now() - startTime;
    const errorObj = error as Record<string, unknown> | null | undefined;
    const errorStatus =
      typeof errorObj?.status === 'number'
        ? errorObj.status
        : typeof errorObj?.statusCode === 'number'
        ? errorObj.statusCode
        : undefined;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorMessageLower = errorMessage.toLowerCase();
    const errorName = error instanceof Error ? error.name : '';

    if (isLocalTimeout || (controller.signal.aborted && errorName === 'AbortError')) {
      console.warn(
        `[Gemini Assistant] Request timed out locally after ${elapsedMs}ms (timeout limit: ${timeoutMs}ms). Operation aborted. Falling back to local decision engine.`
      );
    } else if (
      errorStatus === 400 ||
      errorMessageLower.includes('400') ||
      errorMessageLower.includes('invalid argument') ||
      errorMessageLower.includes('unsupported parameter') ||
      errorMessageLower.includes('bad request')
    ) {
      console.warn(
        `[Gemini Assistant] Bad request or unsupported parameter (status 400) after ${elapsedMs}ms: ${errorMessage}. Falling back to local decision engine.`
      );
    } else if (
      errorStatus === 401 ||
      errorStatus === 403 ||
      errorMessageLower.includes('api key') ||
      errorMessageLower.includes('unauthorized') ||
      errorMessageLower.includes('permission_denied') ||
      errorMessageLower.includes('permission denied')
    ) {
      console.warn(
        `[Gemini Assistant] Authentication or permission issue (status ${errorStatus ?? '401/403'}) after ${elapsedMs}ms: API key invalid or unauthorized. Falling back to local decision engine.`
      );
    } else if (
      errorStatus === 404 ||
      errorMessageLower.includes('not found') ||
      errorMessageLower.includes('is not supported') ||
      errorMessageLower.includes('unsupported model')
    ) {
      console.warn(
        `[Gemini Assistant] Model '${modelName}' unavailable or not found (status 404) after ${elapsedMs}ms. Falling back to local decision engine.`
      );
    } else if (
      errorStatus === 429 ||
      errorMessageLower.includes('429') ||
      errorMessageLower.includes('quota') ||
      errorMessageLower.includes('resource_exhausted') ||
      errorMessageLower.includes('resource has been exhausted')
    ) {
      console.warn(
        `[Gemini Assistant] Rate limit or quota exhausted (status 429) after ${elapsedMs}ms. Falling back to local decision engine.`
      );
    } else if (
      errorStatus === 503 ||
      errorMessageLower.includes('503') ||
      errorMessageLower.includes('overloaded') ||
      errorMessageLower.includes('service unavailable')
    ) {
      console.warn(
        `[Gemini Assistant] Service unavailable or model temporarily overloaded (status 503) after ${elapsedMs}ms. Falling back to local decision engine.`
      );
    } else if (
      errorMessageLower.includes('fetch failed') ||
      errorMessageLower.includes('enotfound') ||
      errorMessageLower.includes('econnrefused') ||
      errorMessageLower.includes('econnreset') ||
      errorMessageLower.includes('network') ||
      errorMessageLower.includes('socket')
    ) {
      console.warn(
        `[Gemini Assistant] Network connectivity error after ${elapsedMs}ms: ${errorMessage}. Falling back to local decision engine.`
      );
    } else {
      console.warn(
        `[Gemini Assistant] Upstream Gemini error${errorStatus ? ` (status ${errorStatus})` : ''} after ${elapsedMs}ms: ${errorMessage}. Falling back to local decision engine.`
      );
    }

    return null;
  } finally {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }
}
