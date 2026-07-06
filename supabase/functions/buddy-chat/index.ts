import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { verifyUser, getCorsHeaders, createSupabaseAdmin } from '../_shared/auth.ts';

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

interface ChatbotConfig {
  provider: Provider;
  model: string;
  apiBase: string;
  apiKey: string | null;
  systemPrompt: string;
}

async function getChatbotConfig(): Promise<ChatbotConfig> {
  const provider: Provider = 'gemini';
  const defaults = PROVIDER_DEFAULTS[provider];

  let config: ChatbotConfig = {
    provider,
    model: defaults.model,
    apiBase: defaults.base,
    apiKey: Deno.env.get(defaults.envKey) || null,
    systemPrompt: SYSTEM_PROMPT,
  };

  try {
    const adminClient = createSupabaseAdmin();
    const { data: settings } = await adminClient
      .from('site_settings')
      .select('chatbot_provider, chatbot_model, chatbot_api_base, chatbot_api_key, chatbot_system_prompt')
      .eq('id', 1)
      .single();

    if (settings?.chatbot_provider && settings.chatbot_provider in PROVIDER_DEFAULTS) {
      const selectedProvider = settings.chatbot_provider as Provider;
      const selectedDefaults = PROVIDER_DEFAULTS[selectedProvider];
      config.provider = selectedProvider;
      config.model = selectedDefaults.model;
      config.apiBase = selectedDefaults.base;
      config.apiKey = Deno.env.get(selectedDefaults.envKey) || null;
    }
    if (settings?.chatbot_model?.trim()) {
      config.model = settings.chatbot_model.trim();
    }
    if (settings?.chatbot_api_base?.trim()) {
      config.apiBase = settings.chatbot_api_base.trim();
    }
    if (settings?.chatbot_api_key?.trim()) {
      config.apiKey = settings.chatbot_api_key.trim();
    }
    if (settings?.chatbot_system_prompt?.trim()) {
      config.systemPrompt = settings.chatbot_system_prompt.trim();
    }
  } catch {
    // Fall back to defaults if settings read fails
  }

  return config;
}

async function chatCompletion(
  message: string,
  conversationHistory: Array<{ role: string; content: string }>,
  config: ChatbotConfig
) {
  if (!config.apiKey) {
    throw new Error(`API key not configured for ${config.provider}`);
  }

  const messages = [
    { role: 'system', content: config.systemPrompt },
    ...conversationHistory.map((h) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content,
    })),
    { role: 'user', content: message },
  ];

  const res = await fetch(`${config.apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: 512,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${config.provider} API error ${res.status}: ${err}`);
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

    const config = await getChatbotConfig();
    const reply = await chatCompletion(message, conversationHistory, config);

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
