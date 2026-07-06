'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, Bot, Eye, EyeOff, Key, MessageSquareText, Server, Cpu } from 'lucide-react';

const DEFAULT_SYSTEM_PROMPT = `You are BUddy, the AI assistant for Baliuag University's Alumni Portal.
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

const PROVIDER_DEFAULTS: Record<string, { model: string; base: string }> = {
  gemini: {
    model: 'gemini-2.0-flash',
    base: 'https://generativelanguage.googleapis.com/v1beta/openai',
  },
  moonshot: {
    model: 'kimi-k2.5',
    base: 'https://api.moonshot.ai/v1',
  },
  openai: {
    model: 'gpt-4o-mini',
    base: 'https://api.openai.com/v1',
  },
};

export function ChatbotForm() {
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [apiBase, setApiBase] = useState('');
  const [chatbotApiKey, setChatbotApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (!error && data) {
        setChatbotEnabled(data.chatbot_enabled ?? true);
        setProvider(data.chatbot_provider || 'gemini');
        setModel(data.chatbot_model || PROVIDER_DEFAULTS[data.chatbot_provider || 'gemini']?.model || 'gemini-2.0-flash');
        setApiBase(data.chatbot_api_base || '');
        setChatbotApiKey(data.chatbot_api_key ?? '');
        setSystemPrompt(data.chatbot_system_prompt || DEFAULT_SYSTEM_PROMPT);
      }
      setLoading(false);
    }
    loadSettings();
  }, [supabase]);

  const handleProviderChange = (value: string) => {
    setProvider(value);
    const defaults = PROVIDER_DEFAULTS[value];
    if (defaults) {
      setModel(defaults.model);
      setApiBase('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: 1,
        chatbot_enabled: chatbotEnabled,
        chatbot_provider: provider || 'gemini',
        chatbot_model: model.trim() || PROVIDER_DEFAULTS[provider]?.model,
        chatbot_api_base: apiBase.trim() || null,
        chatbot_api_key: chatbotApiKey || null,
        chatbot_system_prompt: systemPrompt.trim() || DEFAULT_SYSTEM_PROMPT,
        updated_at: new Date().toISOString(),
      });
    setSaving(false);
    if (error) {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Chatbot settings saved successfully' });
    }
  };

  const handleResetPrompt = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    toast({ title: 'System prompt reset to default' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-mist/60 dark:border-sidebar-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-forest dark:text-sidebar-foreground">
            <Bot className="h-5 w-5 text-primary" />
            BUddy Chatbot Configuration
          </CardTitle>
          <CardDescription>
            Manage the floating AI assistant across the alumni portals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Chatbot</Label>
              <p className="text-sm text-muted-foreground">
                Show the BUddy floating chat widget for all signed-in users.
              </p>
            </div>
            <Switch
              checked={chatbotEnabled}
              onCheckedChange={setChatbotEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              AI Provider
            </Label>
            <p className="text-sm text-muted-foreground">
              Select the AI provider BUddy uses. Defaults to Gemini.
            </p>
            <Select value={provider} onValueChange={handleProviderChange}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="moonshot">Moonshot (Kimi)</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Model
            </Label>
            <p className="text-sm text-muted-foreground">
              Model ID to use for completions. Defaults are set automatically when you change provider.
            </p>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. gemini-2.0-flash"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Key
            </Label>
            <p className="text-sm text-muted-foreground">
              Override the server-side API key for {provider}. Leave blank to use the environment default.
            </p>
            <div className="flex gap-2">
              <Input
                type={showApiKey ? 'text' : 'password'}
                placeholder="Enter API key..."
                value={chatbotApiKey}
                onChange={(e) => setChatbotApiKey(e.target.value)}
                className="flex-1 font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Custom API Base URL (optional)
            </Label>
            <p className="text-sm text-muted-foreground">
              Only needed for custom endpoints or proxies. Leave blank for the provider default.
            </p>
            <Input
              value={apiBase}
              onChange={(e) => setApiBase(e.target.value)}
              placeholder={`Default: ${PROVIDER_DEFAULTS[provider]?.base}`}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4" />
              System Prompt
            </Label>
            <p className="text-sm text-muted-foreground">
              Define BUddy&apos;s personality, role, and behavior. This prompt is sent to the AI on every conversation.
            </p>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={14}
              className="font-mono text-sm resize-y"
              placeholder="Enter the system prompt..."
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetPrompt}
              >
                Reset to default
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
