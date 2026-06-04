'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { LoginSchema, type LoginInput } from '@/lib/schemas/login';
import { logAuditEvent } from '@/lib/audit';
import { Loader2, Eye, EyeOff, ArrowLeft, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── Floating Orb ─── */
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

function LoginForm() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get('confirmed') === 'check-email') {
      setMessage('Check your email to confirm your account before signing in.');
    }
  }, [searchParams]);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (values: LoginInput) => {
    if (attempts >= 5) {
      setError('Too many failed attempts. Please try again later.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    setLoading(false);

    if (signInError) {
      setAttempts((a) => a + 1);
      setError(signInError.message);
      await logAuditEvent('login_failed', 'auth', undefined, { error: signInError.message });
      return;
    }

    if (data.user && !data.user.email_confirmed_at) {
      setError('Your email is not confirmed. Please check your inbox or resend the confirmation link.');
      await logAuditEvent('login_failed', 'auth', undefined, { reason: 'email_not_confirmed' });
      return;
    }

    await logAuditEvent('login_success', 'auth', data.user?.id);
    router.push('/dashboard');
    router.refresh();
  };

  const handleResend = async () => {
    const email = form.getValues('email');
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setResendLoading(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    setResendLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setMessage('Confirmation email resent. Check your inbox.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background p-4">
      {/* Background orbs */}
      <FloatingOrb className="w-[500px] h-[500px] bg-primary/30 -top-20 -left-20" delay={0} />
      <FloatingOrb className="w-[400px] h-[400px] bg-meadow/25 bottom-0 right-0" delay={2} />
      <FloatingOrb className="w-[300px] h-[300px] bg-emerald/20 top-1/2 left-1/3" delay={4} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Back to home */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-20 w-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-meadow flex items-center justify-center p-2 shadow-xl shadow-primary/20"
          >
            <img src="/logos/bu.png" alt="Baliuag University" className="h-full w-full object-contain" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-3xl font-display font-bold text-foreground"
          >
            BU Alumni
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-muted-foreground mt-1"
          >
            Sign in to your alumni account
          </motion.p>
        </div>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl bg-card border border-border shadow-xl shadow-primary/5 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">Welcome Back</h2>
              <p className="text-xs text-muted-foreground">Enter your credentials to continue</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="space-y-2">
                    <div>{error}</div>
                    {error.includes('not confirmed') && (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="text-primary underline hover:no-underline text-sm font-medium"
                      >
                        {resendLoading ? 'Sending…' : 'Resend confirmation email'}
                      </button>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              {message && (
                <Alert className="bg-primary/5 border-primary/20 text-primary">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="bg-input border-input focus:border-primary focus:ring-primary/20 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Your password"
                          className="bg-input border-input focus:border-primary focus:ring-primary/20 transition-all pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <Link href="/forgot-password" className="text-sm text-primary hover:text-emerald font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-emerald text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] h-11"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>
            </form>
          </Form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center text-sm text-slate mt-6"
        >
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary font-semibold hover:text-emerald transition-colors">
            Sign up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
