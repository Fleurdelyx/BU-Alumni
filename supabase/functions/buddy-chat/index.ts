import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { verifyUser, getCorsHeaders } from '../_shared/auth.ts';

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

const MODEL = Deno.env.get('KIMI_MODEL') || 'moonshot-v1-8k';
const API_BASE = Deno.env.get('KIMI_API_BASE') || 'https://api.moonshot.cn/v1';

function getApiKey(): string | null {
  return Deno.env.get('KIMI_API_KEY') || null;
}

async function chatCompletion(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>
) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('KIMI_API_KEY is not configured');
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.map((h) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content,
    })),
    { role: 'user', content: message },
  ];

  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Kimi API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.';
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { user, error: authError } = await verifyUser(req);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized', details: authError }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const reply = await chatCompletion(message, conversationHistory);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Buddy chat error:', err);
    // Always return 200 so the client can read the error details
    return new Response(
      JSON.stringify({
        error: err?.message || 'Internal server error',
        reply: 'BUddy is temporarily unavailable. Please try again later.',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
