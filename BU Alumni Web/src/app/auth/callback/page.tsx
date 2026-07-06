'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Confirming your account...');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    async function handleCallback() {
      try {
        const url = new URL(window.location.href);
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const authType = url.searchParams.get('type') || hashParams.get('type');
        const isSignupFlow = authType === 'signup' || authType === 'email_change';
        setIsSignUp(isSignupFlow);

        // 1. Check if we already have a session (e.g., same-browser confirmation)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session) {
          await updateVerificationStatus(session.user.id);
          return complete(isSignupFlow ? '/signup-confirmed' : '/dashboard');
        }

        // 2. Try PKCE code exchange (works when code verifier is available in this browser)
        const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (!exchangeError && exchangeData?.session) {
          await updateVerificationStatus(exchangeData.session.user.id);
          return complete(isSignupFlow ? '/signup-confirmed' : '/dashboard');
        }

        // 3. Try tokens in URL hash (implicit grant fallback)
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const accessToken = hash.get('access_token');
        const refreshToken = hash.get('refresh_token');
        if (accessToken) {
          const { data: sessionData, error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          if (!setSessionError && sessionData?.session) {
            await updateVerificationStatus(sessionData.session.user.id);
            return complete(isSignupFlow ? '/signup-confirmed' : '/dashboard');
          }
        }

        // 4. If this is a signup/email confirmation and we couldn't establish a session,
        //    the email was likely still confirmed on Supabase's side. Show a friendly
        //    success message and ask the user to sign in (common for cross-device clicks).
        if (isSignupFlow) {
          setStatus('success');
          setMessage('Your email has been confirmed. Please sign in to continue.');
          return;
        }

        // For password recovery or other flows, an error is more appropriate
        throw exchangeError || new Error('Unable to complete authentication.');
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setStatus('error');
        setMessage(err?.message || 'Authentication failed. Please try signing in again.');
      }
    }

    function complete(path: string) {
      setStatus('success');
      setMessage('Redirecting...');
      router.push(path);
    }

    async function updateVerificationStatus(userId: string) {
      try {
        await supabase.from('profiles').update({ is_verified: true }).eq('id', userId);
      } catch (err) {
        console.error('Failed to update verification status:', err);
      }
    }

    handleCallback();
  }, [router, supabase]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-slate">{message}</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
          <h1 className="text-xl font-bold text-forest mb-2">
            {isSignUp ? 'Email Confirmed' : 'Success'}
          </h1>
          <p className="text-slate mb-6">{message}</p>
          <Button asChild>
            <a href="/login">Go to Login</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-4">
      <div className="text-center max-w-md">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-xl font-bold text-destructive mb-2">Authentication Error</h1>
        <p className="text-slate mb-6">{message}</p>
        <Button asChild variant="outline">
          <a href="/login">Go to Login</a>
        </Button>
      </div>
    </div>
  );
}
