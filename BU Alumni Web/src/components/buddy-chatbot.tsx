'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function BuddyChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m BUddy, your BU Alumni assistant. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('site_settings')
      .select('chatbot_enabled')
      .eq('id', 1)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setEnabled(data.chatbot_enabled ?? true);
        }
      });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    const conversationHistory = [
      ...messages.slice(1).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: userMessage },
    ];

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/buddy-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data?.reply || 'Sorry, I could not respond.' },
      ]);
    } catch (err: any) {
      console.error('Buddy chat error:', err);
      const msg = err?.message || String(err) || 'unknown';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `BUddy error: ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!enabled) return null;

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-[1001] p-0 hover:scale-105 transition-transform"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat panel */}
      {open && (
        <Card className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 h-[min(500px,calc(100vh-8rem))] max-h-[600px] shadow-2xl z-[1001] flex flex-col border-2 border-primary/20 overflow-hidden">
          <CardHeader className="bg-primary text-white py-3 shrink-0">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-5 w-5" />
              BUddy — Alumni Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-mint text-forest'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-white rounded-tr-none'
                          : 'bg-fog text-ink rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-mint text-forest flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-fog rounded-2xl rounded-tl-none px-4 py-2 text-sm text-slate">
                      BUddy is typing...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-3 border-t flex gap-2 shrink-0 bg-background">
              <Input
                placeholder="Ask BUddy anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSend} disabled={loading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
