'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, Mail, Shield, IdCard, Bot, Eye, EyeOff, Key, MessageSquareText, RotateCcw, Server, Cpu } from 'lucide-react';

export function AdminSettingsForm() {
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [restrictEmailDomain, setRestrictEmailDomain] = useState(false);
  const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState('');
  const [studentIdOnly, setStudentIdOnly] = useState(false);
  const [requireStudentId, setRequireStudentId] = useState(false);
  const [chatbotEnabled, setChatbotEnabled] = useState(true);
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [apiBase, setApiBase] = useState('');
  const [chatbotApiKey, setChatbotApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
      if (!error && data) {
        setRestrictEmailDomain(data.restrict_email_domain ?? false);
        setAllowedDomains(data.allowed_email_domains ?? []);
        setStudentIdOnly(data.student_id_only_login ?? false);
        setRequireStudentId(data.require_student_id ?? false);
        setChatbotEnabled(data.chatbot_enabled ?? true);
        setProvider(data.chatbot_provider || 'gemini');
        setModel(data.chatbot_model || 'gemini-2.0-flash');
        setApiBase(data.chatbot_api_base || '');
        setChatbotApiKey(data.chatbot_api_key ?? '');
        setSystemPrompt(data.chatbot_system_prompt ?? '');
      }
      setLoading(false);
    }
    loadSettings();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: 1,
        restrict_email_domain: restrictEmailDomain,
        allowed_email_domains: allowedDomains,
        student_id_only_login: studentIdOnly,
        require_student_id: requireStudentId,
        chatbot_enabled: chatbotEnabled,
        chatbot_provider: provider || 'gemini',
        chatbot_model: model.trim() || 'gemini-2.0-flash',
        chatbot_api_base: apiBase.trim() || null,
        chatbot_api_key: chatbotApiKey || null,
        chatbot_system_prompt: systemPrompt.trim() || null,
        updated_at: new Date().toISOString(),
      });
    setSaving(false);
    if (error) {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Settings saved successfully' });
    }
  };

  const addDomain = () => {
    const trimmed = newDomain.trim().toLowerCase();
    if (!trimmed) return;
    const domain = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;
    if (allowedDomains.includes(domain)) {
      toast({ title: 'Domain already added', variant: 'destructive' });
      return;
    }
    setAllowedDomains([...allowedDomains, domain]);
    setNewDomain('');
  };

  const removeDomain = (domain: string) => {
    setAllowedDomains(allowedDomains.filter((d) => d !== domain));
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
      {/* Email Domain Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Registration Restrictions
          </CardTitle>
          <CardDescription>
            Control which email domains are allowed to register.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Restrict Email Domains</Label>
              <p className="text-sm text-muted-foreground">
                Only allow registration from specific email domains (e.g., baliuag.edu.ph).
              </p>
            </div>
            <Switch
              checked={restrictEmailDomain}
              onCheckedChange={setRestrictEmailDomain}
            />
          </div>

          {restrictEmailDomain && (
            <div className="space-y-3 rounded-lg border border-border/60 p-4 bg-muted/30">
              <Label>Allowed Domains</Label>
              <div className="flex flex-wrap gap-2">
                {allowedDomains.map((domain) => (
                  <Badge key={domain} variant="secondary" className="gap-1 pr-1">
                    @{domain}
                    <button
                      type="button"
                      onClick={() => removeDomain(domain)}
                      className="ml-1 rounded-full hover:bg-muted p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {allowedDomains.length === 0 && (
                  <p className="text-sm text-muted-foreground">No domains added. All registrations will be blocked until you add at least one.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="baliuag.edu.ph"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDomain(); } }}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addDomain}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student ID Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IdCard className="h-5 w-5 text-primary" />
            Student ID Login Options
          </CardTitle>
          <CardDescription>
            Configure how student IDs are used for authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Student ID Only Login</Label>
              <p className="text-sm text-muted-foreground">
                Require users to log in with their Student ID instead of email.
              </p>
            </div>
            <Switch
              checked={studentIdOnly}
              onCheckedChange={setStudentIdOnly}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Student ID on Registration</Label>
              <p className="text-sm text-muted-foreground">
                Make Student ID mandatory during signup.
              </p>
            </div>
            <Switch
              checked={requireStudentId}
              onCheckedChange={setRequireStudentId}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chatbot Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            BUddy Chatbot
          </CardTitle>
          <CardDescription>
            Control the floating AI assistant on the alumni portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Chatbot</Label>
              <p className="text-sm text-muted-foreground">
                Show the BUddy floating chat widget for all users.
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
            <Select value={provider} onValueChange={setProvider}>
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
              Model ID to use for completions.
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
              placeholder="https://..."
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4" />
              System Prompt
            </Label>
            <p className="text-sm text-muted-foreground">
              Define BUddy&apos;s personality, role, and behavior. Leave blank to use the server default.
            </p>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={12}
              className="font-mono text-sm resize-y"
              placeholder="Enter a custom system prompt or leave blank to use the default..."
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSystemPrompt('')}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Use default prompt
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
