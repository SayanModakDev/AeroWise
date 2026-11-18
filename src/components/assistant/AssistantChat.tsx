'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Cpu,
  User,
} from 'lucide-react';
import { ModelledAirQuality } from '@/types/air-quality';
import { RankedRecommendationResult } from '@/types/recommendations';
import {
  AssistantApiResponse,
  AssistantChatMessage,
} from '@/types/assistant';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface AssistantChatProps {
  airQuality: ModelledAirQuality;
  recommendations: RankedRecommendationResult;
}

export function AssistantChat({
  airQuality,
  recommendations,
}: AssistantChatProps) {
  const [messages, setMessages] = useState<AssistantChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your **AeroWise Action Assistant**.

I am grounded in your current environmental data for **${airQuality.location.name}** (modelled PM2.5: **${airQuality.current.pm2_5 ?? '—'} µg/m³**, trend: **${airQuality.trend.direction}**) and your personalized household recommendations.

Ask me anything about daily routines, workout timing, low-cost indoor air protection, or cleaner commutes!`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      source: 'local_engine',
      groundingFacts: [
        `City: ${airQuality.location.name}`,
        `Modelled PM2.5: ${airQuality.current.pm2_5 ?? '—'} µg/m³`,
        `Trend: ${airQuality.trend.direction}`,
        `Top Priority: ${recommendations.topThreeActions[0]?.title ?? 'Reduce exposure'}`,
      ],
      disclaimer:
        'AeroWise provides environmental decision support. Not medical advice. For severe symptoms, seek medical care.',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedGroundingId, setExpandedGroundingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    'How can I reduce indoor pollution without buying a purifier?',
    'Why should I change my outdoor exercise time today?',
    'What are low-emission commute alternatives for my routine?',
    'How should a family with young children approach a polluted day?',
    'Which of my household habits should I change first?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    if (query.length > 500) {
      alert('Message must be under 500 characters.');
      return;
    }

    const userMsg: AssistantChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build safe privacy-stripped payload
      const payload = {
        message: query,
        environmentalContext: {
          city: airQuality.location.name,
          country: airQuality.location.country,
          currentPm25: airQuality.current.pm2_5,
          currentPm10: airQuality.current.pm10,
          trendDirection: airQuality.trend.direction,
          whoPm25Ratio: airQuality.whoComparison.pm25Ratio,
        },
        topActions: recommendations.topThreeActions.map((a) => ({
          title: a.title,
          category: a.category,
          whatToDo: a.whatToDo,
        })),
        history: messages.slice(-4).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      };

      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data: AssistantApiResponse = await res.json();

      const assistantMsg: AssistantChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        source: data.source,
        groundingFacts: data.groundingFacts,
        disclaimer: data.disclaimer,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: AssistantChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content:
          'Unable to reach the assistant service at this moment. You can still consult your full deterministic daily plan in the "Daily Planner" tab.',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        source: 'local_engine',
        disclaimer:
          'AeroWise local fallback mode. Please check network connectivity.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Privacy & Medical Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h2 className="text-base sm:text-lg font-bold">
              AeroWise GenAI Action Assistant
            </h2>
          </div>
          <Badge variant="primary" size="sm">
            Grounded AI & Local Fallback
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Guard:</strong> Exact GPS coordinates and medical
              sensitivity flags stay on your device and are never sent to AI.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Not Medical Advice:</strong> AeroWise provides environmental
              exposure planning. For acute symptoms, consult a physician.
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <Card className="flex flex-col h-[560px] p-0 overflow-hidden border-slate-200 shadow-xs">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isGemini = msg.source === 'gemini';
            const isExpanded = expandedGroundingId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  isUser ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                    isUser
                      ? 'bg-slate-700'
                      : isGemini
                      ? 'bg-indigo-600'
                      : 'bg-teal-700'
                  }`}
                >
                  {isUser ? (
                    <User className="w-4 h-4" />
                  ) : isGemini ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <Cpu className="w-4 h-4" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`space-y-2 text-xs sm:text-sm rounded-2xl p-4 shadow-2xs leading-relaxed ${
                    isUser
                      ? 'bg-teal-700 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  {/* Assistant Source Badge */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-100 text-[11px]">
                      <div className="flex items-center gap-1.5 font-semibold">
                        {isGemini ? (
                          <span className="text-indigo-600 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Generated by Google Gemini AI
                          </span>
                        ) : (
                          <span className="text-teal-700 flex items-center gap-1">
                            <Cpu className="w-3 h-3" />
                            AeroWise Decision Engine (Local Fallback)
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {msg.timestamp}
                      </span>
                    </div>
                  )}

                  {/* Message body rendered simply */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.content}
                  </div>

                  {/* Grounding Facts Expander (for Assistant messages) */}
                  {!isUser && msg.groundingFacts && msg.groundingFacts.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() =>
                          setExpandedGroundingId(isExpanded ? null : msg.id)
                        }
                        className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3 h-3 text-teal-600" />
                        <span>
                          {isExpanded
                            ? 'Hide Grounding Facts'
                            : 'View Verified Grounding Facts'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                          <span className="font-bold text-slate-700 block">
                            Supplied Environmental Facts:
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {msg.groundingFacts.map((f, idx) => (
                              <li key={idx}>{f}</li>
                            ))}
                          </ul>
                          {msg.disclaimer && (
                            <p className="text-[10px] text-slate-400 pt-1 italic">
                              {msg.disclaimer}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-white rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <span>Formulating grounded action advice...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sample Prompt Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">
            Suggestions:
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg whitespace-nowrap transition-colors disabled:opacity-50 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your routine, indoor air, or commute..."
              maxLength={500}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
