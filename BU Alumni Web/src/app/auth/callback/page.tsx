'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState('');

  useEffect(() => {
    async function handleCallback() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Auth callback error:', sessionError);
        setError('Authentication failed. Please try signing in again.');
        return;
      }

      if (session) {
        router.push('/dashboard');
      } else {
        // Check for auth code in URL (PKCE flow)
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (exchangeError) {
          console.error('Code exchange error:', exchangeError);
          setError('Authentication failed. Please try signing in again.');
        } else {
          router.push('/dashboard');
        }
      }
    }

    handleCallback();
  }, [router, supabase]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-destructive mb-2">Authentication Error</h1>
          <p className="text-slate">{error}</p>
          <a href="/login" className="text-primary hover:underline mt-4 inline-block">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-4">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-slate">Confirming your account...</p>
      </div>
    </div>
  );
}
