import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/assistant/route';
import { NextRequest } from 'next/server';

describe('POST /api/assistant Route Handler', () => {
  it('rejects empty message with status 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '',
        environmentalContext: {
          city: 'Delhi',
          country: 'India',
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid request structure');
  });

  it('rejects overly long message exceeding 600 characters with status 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'A'.repeat(601),
        environmentalContext: {
          city: 'Delhi',
          country: 'India',
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('successfully returns local engine fallback response when GEMINI_API_KEY is unset', async () => {
    // Ensure GEMINI_API_KEY is not set
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const req = new NextRequest('http://localhost:3000/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What should I do about outdoor exercise today?',
        environmentalContext: {
          city: 'New Delhi',
          country: 'India',
          currentPm25: 180,
          currentPm10: 270,
          trendDirection: 'rising',
          whoPm25Ratio: 12.0,
        },
        topActions: [
          {
            title: 'Shift Outdoor Errands to Lower-Pollution Afternoon Hours',
            category: 'protect_household',
            whatToDo: 'Postpone outdoor tasks away from morning rush.',
          },
        ],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.source).toBe('local_engine');
    expect(body.reply).toBeDefined();
    expect(body.reply).toContain('New Delhi');
    expect(body.groundingFacts.length).toBeGreaterThan(0);
    expect(body.disclaimer).toContain('AeroWise Air-to-Action Engine (Local Fallback)');

    // Restore key if it was present
    if (originalKey) process.env.GEMINI_API_KEY = originalKey;
  });
});
