import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are BUddy, the AI assistant for Baliuag University's Alumni Portal.
You help alumni navigate the platform, complete the CHED Graduate Tracer Survey,
and connect with the alumni community through the forum.

You can help with:
- Explaining each section of the GTS questionnaire
- Navigating the forum and finding relevant discussions
- Understanding employment statistics on the dashboard
- General questions about Baliuag University

Always respond in a friendly, professional, and encouraging tone.
Keep responses concise (under 150 words unless asked for more detail).
Do not make up information about alumni, employment rates, or university policies.`;

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.KIMI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'KIMI_API_KEY not configured' }, { status: 500 });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map((h: { role: string; content: string }) => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    const res = await fetch('https://api.moonshot.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages,
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Moonshot API error:', res.status, err);
      return NextResponse.json(
        { error: `Moonshot API error ${res.status}: ${err}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.';

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('Buddy chat API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
