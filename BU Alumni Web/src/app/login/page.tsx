'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Loader2, Eye, EyeOff, ArrowLeft, GraduationCap, Mail, IdCard, ShieldCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';
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

type LoginMode = 'email' | 'studentId';

function LoginForm() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [loginMode, setLoginMode] = useState<LoginMode>('email');
  const [studentIdOnly, setStudentIdOnly] = useState(false);
  const [needsMFA, setNeedsMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', studentId: '', password: '', rememberMe: false },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (searchParams.get('confirmed') === 'check-email') {
      setMessage('Check your email (including spam/junk folders) to confirm your account before signing in.');
    }
    const savedRemember = localStorage.getItem('bu_alumni_remember_me');
    if (savedRemember === 'true') {
      form.setValue('rememberMe', true);
    }
    // Load site settings
    supabase.from('site_settings').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) {
        setStudentIdOnly(data.student_id_only_login ?? false);
        if (data.student_id_only_login) setLoginMode('studentId');
      }
    });
  }, [searchParams, form, supabase]);

  const onSubmit = async (values: LoginInput) => {
    if (attempts >= 5) {
      setError('Too many failed attempts. Please try again later.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);

    // Enforce student ID only if enabled
    if (studentIdOnly && loginMode === 'email') {
      setLoading(false);
      setError('Student ID login is required. Please switch to the Student ID tab.');
      return;
    }

    let email = values.email || '';

    // If student ID mode, look up the email from profiles
    if (loginMode === 'studentId' && values.studentId) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('student_id', values.studentId)
        .single();

      if (profileError || !profileData?.email) {
        setLoading(false);
        setAttempts((a) => a + 1);
        setError('Student ID not found. Please check and try again.');
        await logAuditEvent('login_failed', 'auth', undefined, {
          error: 'student_id_not_found',
          studentId: values.studentId,
        });
        return;
      }
      email = profileData.email;
    }

    if (!email) {
      setLoading(false);
      setError('Please enter your email or student ID.');
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: values.password,
    });

    if (signInError) {
      setLoading(false);
      setAttempts((a) => a + 1);
      const errMsg = signInError.message.toLowerCase();

      if (errMsg.includes('invalid login credentials')) {
        setError('Invalid email or password. Please check both fields and try again.');
      } else if (errMsg.includes('email not confirmed')) {
        setError('Your email is not confirmed. Please check your inbox and spam/junk folders, or resend the confirmation link.');
      } else if (errMsg.includes('too many requests')) {
        setError('Too many login attempts. Please wait a moment and try again.');
      } else if (errMsg.includes('network') || errMsg.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(signInError.message);
      }

      await logAuditEvent('login_failed', 'auth', undefined, {
        error: signInError.message,
        reason: errMsg.includes('invalid login credentials') ? 'invalid_credentials' : 'other',
      });
      return;
    }

    if (data.user && !data.user.email_confirmed_at) {
      setLoading(false);
      setError('Your email is not confirmed. Please check your inbox and spam/junk folders, or resend the confirmation link.');
      await logAuditEvent('login_failed', 'auth', undefined, { reason: 'email_not_confirmed' });
      return;
    }

    // Update is_verified in profiles if email is confirmed
    if (data.user?.email_confirmed_at) {
      await supabase.from('profiles').update({ is_verified: true }).eq('id', data.user.id);
    }

    // Handle "Remember me"
    if (values.rememberMe) {
      localStorage.setItem('bu_alumni_remember_me', 'true');
    } else {
      localStorage.removeItem('bu_alumni_remember_me');
    }

    // Check AAL / MFA
    const aal = data.session?.user?.app_metadata?.aal as string | undefined;
    if (aal === 'aal2') {
      setLoading(false);
      await logAuditEvent('login_success', 'auth', data.user?.id);
      router.push('/dashboard');
      router.refresh();
      return;
    }

    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) {
      setLoading(false);
      setError('Could not check two-factor authentication status. Please try again.');
      return;
    }

    const totpFactor = factorsData?.totp?.find((f: any) => f.status === 'verified');
    if (totpFactor) {
      setMfaFactorId(totpFactor.id);
      setNeedsMFA(true);
      setLoading(false);
      setMessage('Enter the 6-digit code from your authenticator app.');
      return;
    }

    setLoading(false);
    await logAuditEvent('login_success', 'auth', data.user?.id);
    router.push('/dashboard');
    router.refresh();
  };

  const handleMFAVerify = async () => {
    if (!mfaFactorId || mfaCode.length !== 6) {
      setError('Enter a valid 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // Make sure the client still has an active session before verifying.
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          setLoading(false);
          setError('Your session has expired. Please sign in again.');
          return;
        }
      }

      // Re-challenge so the challenge and verification use the same session.
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId,
      });
      if (challengeError || !challengeData) {
        setLoading(false);
        setError('Could not start two-factor authentication. Please try again.');
        return;
      }

      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code: mfaCode.replace(/\s/g, ''),
      });

      setLoading(false);

      if (verifyError || !verifyData?.user) {
        setAttempts((a) => a + 1);
        setError(verifyError?.message || 'Invalid authentication code. Please try again.');
        return;
      }

      await logAuditEvent('login_success', 'auth', verifyData.user.id);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    const email = form.getValues('email');
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setResendLoading(true);
    setResendCount((c) => c + 1);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setResendLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setError('');
      setMessage('Confirmation email sent. Check your inbox and spam/junk folders.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background p-4">
      {/* Background orbs — reduced opacity for less intensity */}
      <FloatingOrb className="w-[400px] h-[400px] bg-primary/20 -top-10 -left-10" delay={0} />
      <FloatingOrb className="w-[300px] h-[300px] bg-meadow/15 bottom-0 right-0" delay={2} />

      {/* Grid pattern — more subtle */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
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

        {/* Logo — smaller, more minimal */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-16 w-16 mx-auto mb-3 rounded-xl bg-white dark:bg-card border border-border flex items-center justify-center p-2 shadow-lg shadow-primary/5"
          >
            <img src="/logos/bu.png" alt="Baliuag University" className="h-full w-full object-contain" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-2xl font-display font-bold text-foreground"
          >
            BU Alumni
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-muted-foreground mt-1 text-sm"
          >
            Sign in to your alumni account
          </motion.p>
        </div>

        {/* Glass card — cleaner, less padding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl bg-card border border-border shadow-lg shadow-primary/5 p-5 sm:p-6"
        >
          {needsMFA ? (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg text-foreground">Two-Factor Authentication</h2>
                  <p className="text-xs text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
              {message && (
                <Alert className="bg-primary/5 border-primary/20 text-primary py-2">
                  <AlertDescription className="text-sm">{message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="mfa-code" className="text-foreground/80 text-sm">Authenticator Code</Label>
                <Input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && mfaCode.length === 6) {
                      e.preventDefault();
                      handleMFAVerify();
                    }
                  }}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-12 bg-input border-input focus:border-primary focus:ring-primary/20 transition-all"
                  autoFocus
                />
              </div>

              <Button
                onClick={handleMFAVerify}
                disabled={loading || mfaCode.length !== 6}
                className="w-full bg-primary hover:bg-emerald text-white shadow-md shadow-primary/15 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.01] h-10"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setNeedsMFA(false); setMfaCode(''); setMfaFactorId(null); setError(''); setMessage(''); }}
                className="w-full h-10"
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
          {/* Mode toggle — clean tabs */}
          <div className="flex rounded-lg bg-muted/50 p-1 mb-5">
            <button
              type="button"
              onClick={() => { setLoginMode('email'); form.setValue('studentId', ''); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                loginMode === 'email'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('studentId'); form.setValue('email', ''); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                loginMode === 'studentId'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <IdCard className="h-4 w-4" />
              Student ID
            </button>
          </div>
          {studentIdOnly && (
            <Alert className="mb-4 py-2 bg-amber-50 border-amber-200 text-amber-800">
              <AlertDescription className="text-sm">
                This portal currently requires Student ID login.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-3 mb-5">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">Welcome Back</h2>
              <p className="text-xs text-muted-foreground">
                {loginMode === 'email' ? 'Enter your email and password' : 'Enter your 7-digit student ID and password'}
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="space-y-2 text-sm">
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
                <motion.div
                  key={resendCount}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Alert className="bg-primary/5 border-primary/20 text-primary py-2">
                    <AlertDescription className="text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      {message}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {loginMode === 'email' ? (
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 text-sm">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          className="bg-input border-input focus:border-primary focus:ring-primary/20 transition-all h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="studentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80 text-sm">Student ID</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          maxLength={7}
                          placeholder="1234567"
                          className="bg-input border-input focus:border-primary focus:ring-primary/20 transition-all h-10 tracking-widest font-mono"
                          {...field}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 7);
                            field.onChange(val);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80 text-sm">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Your password"
                          className="bg-input border-input focus:border-primary focus:ring-primary/20 transition-all pr-10 h-10"
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
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal text-muted-foreground cursor-pointer">
                        Keep me logged in
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <Link href="/forgot-password" className="text-sm text-primary hover:text-emerald font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-emerald text-white shadow-md shadow-primary/15 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.01] h-10"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In
              </Button>

              {loginMode === 'email' && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-emerald font-medium transition-colors disabled:opacity-60"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Sending confirmation email…
                      </>
                    ) : resendCount > 0 ? (
                      <>
                        <Mail className="h-3.5 w-3.5" />
                        Didn&apos;t receive it? Resend confirmation email
                      </>
                    ) : (
                      <>
                        <Mail className="h-3.5 w-3.5" />
                        Didn&apos;t receive confirmation email? Resend
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </Form>
            </>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-5"
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
