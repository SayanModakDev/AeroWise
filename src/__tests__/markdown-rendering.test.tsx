import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { AssistantMarkdown } from '@/components/assistant/AssistantMarkdown';

describe('AssistantMarkdown Component Rendering', () => {
  it('renders bold text as <strong> tags with appropriate styling', () => {
    const markdown = 'Protect your home with **wet mopping** and **N95 masks**.';
    const html = renderToString(<AssistantMarkdown content={markdown} />);

    expect(html).toContain('<strong class="font-semibold text-slate-900">wet mopping</strong>');
    expect(html).toContain('<strong class="font-semibold text-slate-900">N95 masks</strong>');
    // Ensure raw markdown asterisks are not present
    expect(html).not.toContain('**wet mopping**');
  });

  it('renders numbered lists as formatted <ol> and <li> elements', () => {
    const markdown = `Here are 3 recommendations:
1. Shift morning workout to afternoon.
2. Damp wet-mop indoor floors.
3. Keep windows closed during traffic peaks.`;

    const html = renderToString(<AssistantMarkdown content={markdown} />);

    expect(html).toContain('<ol class="list-decimal pl-5 my-1.5 space-y-1">');
    expect(html).toContain('<li class="leading-relaxed pl-0.5">Shift morning workout to afternoon.</li>');
    expect(html).toContain('<li class="leading-relaxed pl-0.5">Damp wet-mop indoor floors.</li>');
    expect(html).toContain('<li class="leading-relaxed pl-0.5">Keep windows closed during traffic peaks.</li>');
  });

  it('renders bullet points as formatted <ul> and <li> elements', () => {
    const markdown = `- Avoid burning incense
- Install door sweep
- Use N95 outdoors`;

    const html = renderToString(<AssistantMarkdown content={markdown} />);

    expect(html).toContain('<ul class="list-disc pl-5 my-1.5 space-y-1">');
    expect(html).toContain('<li class="leading-relaxed pl-0.5">Avoid burning incense</li>');
  });

  it('renders long multi-paragraph messages with proper paragraph separation and wrapping classes', () => {
    const markdown = `Severe smog is currently trapped across the urban airshed due to low wind speeds and atmospheric inversion.

Closing windows during morning rush hours prevents high roadside particulate accumulation from penetrating living spaces.

In the afternoon between 13:00 and 15:30, thermal mixing typically creates a brief window with relatively lower particulate concentrations.`;

    const html = renderToString(<AssistantMarkdown content={markdown} />);

    // Must contain 3 distinct paragraph tags with paragraph spacing
    const paragraphMatches = html.match(/<p class="mb-2 last:mb-0 leading-relaxed text-slate-800">/g);
    expect(paragraphMatches?.length).toBe(3);
    expect(html).toContain('break-words');
  });

  it('renders links safely with target="_blank" and rel="noopener noreferrer"', () => {
    const markdown = 'Consult official monitoring at [CPCB Portal](https://app.cpcbccr.com/AQI_India/).';
    const html = renderToString(<AssistantMarkdown content={markdown} />);

    expect(html).toContain('href="https://app.cpcbccr.com/AQI_India/"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('CPCB Portal');
  });

  it('renders inline code with monospaced styling', () => {
    const markdown = 'Modelled concentration is measured in `µg/m³` units.';
    const html = renderToString(<AssistantMarkdown content={markdown} />);

    expect(html).toContain('<code class="bg-slate-100 text-teal-800 px-1 py-0.5 rounded text-[11px] font-mono">µg/m³</code>');
  });
});
