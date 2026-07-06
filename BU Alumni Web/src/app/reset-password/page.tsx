'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createResetClient } from '@/lib/supabase/reset-client';
import { createClient as createSsrClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle2 } from 'lucide-react';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createResetClient();

  useEffect(() => {
    let mounted = true;

    const cleanUrl = () => {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      url.hash = '';
      url.search = '';
      window.history.replaceState({}, document.title, url.toString());
    };

    async function init() {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');
      const type = hash.get('type') || searchParams.get('type');
      const hashError = hash.get('error_description') || hash.get('error');
      const queryError = searchParams.get('error_description') || searchParams.get('error');

      if (hashError || queryError) {
        if (!mounted) return;
        setError(decodeURIComponent((hashError || queryError)!));
        setChecking(false);
        cleanUrl();
        return;
      }

      // Recovery links redirect with the session tokens in the hash fragment.
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!mounted) return;
        if (sessionError) {
          setError(sessionError.message);
        } else {
          setHasSession(true);
        }
        setChecking(false);
        cleanUrl();
        return;
      }

      // Fallback for query-string tokens (some email clients / PKCE flows).
      const tokenHash = searchParams.get('token_hash') || searchParams.get('token');
      if (tokenHash && type === 'recovery') {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });
        if (!mounted) return;
        if (verifyError) {
          setError(verifyError.message);
        } else {
          setHasSession(true);
        }
        setChecking(false);
        cleanUrl();
        return;
      }

      const code = searchParams.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (!mounted) return;
        if (exchangeError) {
          setError(exchangeError.message);
        } else {
          setHasSession(true);
        }
        setChecking(false);
        cleanUrl();
        return;
      }

      // No tokens in URL: rely on an existing session (e.g. user is already signed in).
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!mounted) return;
      if (sessionError) {
        setError(sessionError.message);
      } else if (sessionData?.session) {
        setHasSession(true);
      } else {
        setError('This password reset link is invalid or has expired. Please request a new one.');
      }
      setChecking(false);
    }

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        setHasSession(true);
        setChecking(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      // Sign the user out of the reset client and the SSR cookie session so
      // they can log back in with the new password.
      await supabase.auth.signOut();
      try {
        await createSsrClient().auth.signOut();
      } catch {
        // ignore if there is no SSR session to sign out
      }
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-20 w-20 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center p-1">
            <img src="/logos/bu.png" alt="Baliuag University" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">BU Alumni</h1>
          <p className="text-muted-foreground mt-2">Reset your password</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              {success
                ? 'Your password has been updated.'
                : hasSession
                ? 'Enter your new password below'
                : 'Verifying your recovery link...'}
            </CardDescription>
          </CardHeader>

          {checking ? (
            <CardContent className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          ) : success ? (
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <AlertDescription>
                  Password updated successfully. Redirecting you to sign in...
                </AlertDescription>
              </Alert>
            </CardContent>
          ) : error && !hasSession ? (
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="flex justify-center">
                <Link href="/forgot-password">
                  <Button variant="outline">Request a new link</Button>
                </Link>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/login" className="text-primary font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
