'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

/* ─── Typing Dots ─── */
function TypingIndicator() {
  return (
    <div className="flex gap-2 items-center">
      <div className="h-8 w-8 rounded-full bg-mint text-forest flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4" />
      </div>
      <div className="bg-fog rounded-2xl rounded-tl-none px-4 py-3 text-sm">
        <div className="flex gap-1 items-center h-5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-2 h-2 rounded-full bg-slate"
              animate={{
                y: [0, -6, 0],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Message Bubble ─── */
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 26 }}
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05, type: 'spring', stiffness: 400, damping: 20 }}
        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
          isUser ? 'bg-primary/10 text-primary' : 'bg-mint text-forest'
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </motion.div>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
          isUser
            ? 'bg-primary text-white rounded-tr-none'
            : 'bg-fog text-ink rounded-tl-none'
        }`}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

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
      const { data, error } = await supabase.functions.invoke('buddy-chat', {
        body: {
          message: userMessage,
          conversationHistory,
        },
      });

      if (error) throw error;
      if (data?.error) {
        throw new Error(data.error);
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
        {
          role: 'assistant',
          content: `BUddy error: ${msg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setOpen(!open)}
          className="h-14 w-14 rounded-full shadow-lg p-0 hover:scale-105 transition-transform"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-6 w-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="h-6 w-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="fixed bottom-24 right-6 z-50"
          >
            <Card className="w-96 h-[500px] shadow-2xl flex flex-col border-2 border-primary/20 overflow-hidden">
              <CardHeader className="bg-primary text-white py-3 shrink-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  BUddy — Alumni Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {messages.map((msg, i) => (
                        <MessageBubble key={i} msg={msg} />
                      ))}
                    </AnimatePresence>
                    <AnimatePresence>
                      {loading && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          <TypingIndicator />
                        </motion.div>
                      )}
                    </AnimatePresence>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
