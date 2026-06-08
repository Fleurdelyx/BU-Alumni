'use client';

import { useState, useEffect, Suspense } from 'react';
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
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { LoginSchema, type LoginInput } from '@/lib/schemas/login';
import { Loader2, Eye, EyeOff, ShieldAlert } from 'lucide-react';

function LoginForm() {
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [needsMFA, setNeedsMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get('mfa_required') === 'true') {
      setMessage('Two-factor authentication is required for admin access.');
    }
    if (searchParams.get('reason') === 'unauthorized') {
      setError('You do not have admin or moderator privileges.');
    }
  }, [searchParams]);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const handlePasswordSignIn = async (values: LoginInput) => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (signInError) {
        setLoading(false);
        setError(signInError.message);
        return;
      }

      if (!data.user) {
        setLoading(false);
        setError('Sign-in failed. Please try again.');
        return;
      }

      // Check role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        setLoading(false);
        setError('Could not verify admin privileges. Please try again.');
        return;
      }

      if (!profile || !['admin', 'moderator'].includes(profile.role)) {
        await supabase.auth.signOut();
        setLoading(false);
        setError('You do not have admin or moderator privileges.');
        return;
      }

      // Check if already aal2
      const aal = data.session?.user?.app_metadata?.aal as string | undefined;
      if (aal === 'aal2') {
        setLoading(false);
        router.push('/');
        return;
      }

      // Check if MFA is enrolled
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) {
        setLoading(false);
        setError('Could not check 2FA status. Please try again.');
        return;
      }

      const totpFactor = factorsData?.totp?.find((f: any) => f.status === 'verified');

      if (totpFactor) {
        setCredentials({ email: values.email, password: values.password });
        setNeedsMFA(true);
        setLoading(false);
        setMessage('Enter the 6-digit code from your authenticator app.');
      } else {
        // No MFA required
        setLoading(false);
        router.push('/');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    }
  };

  const handleMFAVerify = async () => {
    if (!credentials || mfaCode.length !== 6) {
      setError('Enter a valid 6-digit code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Use nonce to verify MFA in a single sign-in call
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
        options: {
          nonce: mfaCode,
        },
      });

      if (signInError) {
        setLoading(false);
        setError(signInError.message);
        return;
      }

      if (!data.user) {
        setLoading(false);
        setError('Verification failed. Please try again.');
        return;
      }

      setLoading(false);
      router.push('/');
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-20 w-20 mx-auto mb-4 rounded-xl bg-white dark:bg-card border border-border flex items-center justify-center p-1 shadow-sm">
            <img src="/logos/bu.png" alt="Baliuag University" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-3xl font-display font-bold text-forest">Admin Portal</h1>
          <p className="text-slate mt-2">Baliuag University Alumni Tracer Study</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              {needsMFA ? 'Two-Factor Authentication' : 'Sign In'}
            </CardTitle>
            <CardDescription>
              {needsMFA ? (message || 'Enter your authenticator code') : 'Admin and moderator access only'}
            </CardDescription>
          </CardHeader>

          {!needsMFA ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handlePasswordSignIn)}>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {message && !error && (
                    <Alert>
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@example.com" {...field} />
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Your password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign In
                  </Button>
                </CardFooter>
              </form>
            </Form>
          ) : (
            <>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {message && !error && (
                  <Alert>
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="mfa-code">Authenticator Code</Label>
                  <Input
                    id="mfa-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-[0.5em] font-mono"
                    autoFocus
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button onClick={handleMFAVerify} className="w-full" disabled={loading || mfaCode.length !== 6}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Verify
                </Button>
                <Button variant="ghost" onClick={() => { setNeedsMFA(false); setMfaCode(''); setError(''); setMessage(''); }}>
                  Back to sign in
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        <p className="text-center text-sm text-slate mt-6">
          Need to set up 2FA?{' '}
          <a
            href="https://alumni.baliuag.edu.ph/settings"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            Go to Alumni Portal Settings
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-paper">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
