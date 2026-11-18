export interface AssistantEnvironmentalContext {
  city: string;
  country: string;
  currentPm25: number | null;
  currentPm10: number | null;
  trendDirection: string;
  whoPm25Ratio: number | null;
}

export interface AssistantActionSummary {
  title: string;
  category: string;
  whatToDo: string;
}

export interface AssistantChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'gemini' | 'local_engine';
  groundingFacts?: string[];
  disclaimer?: string;
}

export interface AssistantApiRequest {
  message: string;
  environmentalContext: AssistantEnvironmentalContext;
  topActions: AssistantActionSummary[];
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export interface AssistantApiResponse {
  reply: string;
  source: 'gemini' | 'local_engine';
  groundingFacts: string[];
  disclaimer: string;
}
