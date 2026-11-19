import { GoogleGenAI } from '@google/genai';
import {
  AssistantActionSummary,
  AssistantEnvironmentalContext,
} from '@/types/assistant';

const DEFAULT_MODEL = 'gemini-3.8-flash';

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

  const modelName = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
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

STRICT GROUNDING & SAFETY RULES:
1. ONLY refer to the supplied environmental facts and verified action candidates:
   - City: ${params.environmentalContext.city}
   - Modelled PM2.5: ${params.environmentalContext.currentPm25 ?? 'N/A'} µg/m³ (from CAMS Global forecast, NOT an official regulatory monitoring station)
   - Modelled PM10: ${params.environmentalContext.currentPm10 ?? 'N/A'} µg/m³
   - Trend: ${params.environmentalContext.trendDirection}
   - Verified candidate actions:
${params.topActions.map((a, i) => `     ${i + 1}. [${a.category}] ${a.title}: ${a.whatToDo}`).join('\n')}

2. NEVER invent live AQI numbers, monitoring stations, medical statistics, or health guarantees.
3. NEVER diagnose medical conditions or advise changes to prescribed medications. If a user mentions severe or worsening symptoms (e.g. chest pain, severe asthma attack), explicitly instruct them to seek urgent in-person medical care.
4. Distinguish modelled numerical forecasts from official regulatory government stations (like India's CPCB).
5. Explain exposure reduction vs emissions reduction clearly.
6. Provide free and low-cost practical solutions first.
7. Keep responses concise (under 250 words), empathetic, and formatted in clean markdown bullet points.`;

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
        temperature: 0.3,
        maxOutputTokens: 600,
        abortSignal: controller.signal,
      },
    });

    clearTimeout(timeoutId);

    const replyText = response.text;
    if (!replyText || replyText.trim() === '') {
      return null;
    }

    return {
      reply: replyText.trim(),
      groundingFacts,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('Gemini API call encountered an error, falling back to local engine:', error);
    return null;
  }
}
