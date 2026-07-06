import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

type Provider = 'gemini' | 'moonshot' | 'openai';

const PROVIDER_DEFAULTS: Record<
  Provider,
  { model: string; base: string; envKey: string }
> = {
  gemini: {
    model: 'gemini-2.0-flash',
    base: 'https://generativelanguage.googleapis.com/v1beta/openai',
    envKey: 'GEMINI_API_KEY',
  },
  moonshot: {
    model: 'kimi-k2.5',
    base: 'https://api.moonshot.ai/v1',
    envKey: 'KIMI_API_KEY',
  },
  openai: {
    model: 'gpt-4o-mini',
    base: 'https://api.openai.com/v1',
    envKey: 'OPENAI_API_KEY',
  },
};

function getDefaultApiKey(provider: Provider): string | undefined {
  return process.env[PROVIDER_DEFAULTS[provider].envKey];
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch site settings for provider, key, model, base URL, and custom system prompt
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let provider: Provider = 'gemini';
    let model = PROVIDER_DEFAULTS[provider].model;
    let apiBase = PROVIDER_DEFAULTS[provider].base;
    let apiKey: string | undefined = getDefaultApiKey(provider);
    let systemPrompt = SYSTEM_PROMPT;

    if (supabaseUrl && supabaseServiceKey) {
      try {
        const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
        const { data: settings } = await adminClient
          .from('site_settings')
          .select('chatbot_provider, chatbot_model, chatbot_api_base, chatbot_api_key, chatbot_system_prompt')
          .eq('id', 1)
          .single();

        if (settings?.chatbot_provider && settings.chatbot_provider in PROVIDER_DEFAULTS) {
          provider = settings.chatbot_provider as Provider;
          model = PROVIDER_DEFAULTS[provider].model;
          apiBase = PROVIDER_DEFAULTS[provider].base;
          apiKey = getDefaultApiKey(provider);
        }
        if (settings?.chatbot_model?.trim()) {
          model = settings.chatbot_model.trim();
        }
        if (settings?.chatbot_api_base?.trim()) {
          apiBase = settings.chatbot_api_base.trim();
        }
        if (settings?.chatbot_api_key?.trim()) {
          apiKey = settings.chatbot_api_key.trim();
        }
        if (settings?.chatbot_system_prompt?.trim()) {
          systemPrompt = settings.chatbot_system_prompt.trim();
        }
      } catch {
        // Fallback to defaults if settings read fails
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: `API key not configured for ${provider}` },
        { status: 500 }
      );
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((h: { role: string; content: string }) => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    const res = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`${provider} API error:`, res.status, err);
      return NextResponse.json(
        { error: `${provider} API error ${res.status}: ${err}` },
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
