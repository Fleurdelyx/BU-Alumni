'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, ShieldCheck, Copy } from 'lucide-react';
import QRCode from 'qrcode';

export function SecurityForm() {
  const supabase = createClient();
  const [factors, setFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadFactors();
  }, []);

  const loadFactors = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp || []);
    setLoading(false);
  };

  const handleEnroll = async () => {
    setError('');
    setEnrolling(true);
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Authenticator App',
    });
    setEnrolling(false);

    if (enrollError) {
      setError(enrollError.message);
      return;
    }

    const secret = data.totp.secret;
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email || '';

    // Build a custom TOTP URI with "BU Tracer" as the issuer
    const issuer = 'BU Tracer';
    const account = encodeURIComponent(email);
    const encodedIssuer = encodeURIComponent(issuer);
    const totpUri = `otpauth://totp/${encodedIssuer}:${account}?secret=${secret}&issuer=${encodedIssuer}`;

    try {
      const customQr = await QRCode.toDataURL(totpUri, { width: 256, margin: 2 });
      setQrCode(customQr);
    } catch {
      // Fallback to Supabase's QR if generation fails
      setQrCode(data.totp.qr_code);
    }

    setSecret(secret);
    setFactorId(data.id);
  };

  const handleVerify = async () => {
    if (!factorId || !code) return;
    if (verifyAttempts >= 5) {
      setError('Too many failed attempts. Please unenroll and re-enroll 2FA.');
      return;
    }
    setError('');
    setVerifying(true);

    try {
      // Ensure the browser client still holds a session before challenging/verifying.
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError || !refreshData.session) {
          setVerifying(false);
          setError('Your session has expired. Please sign in again to enable 2FA.');
          return;
        }
      }

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) {
        setVerifying(false);
        setError(challengeError.message);
        return;
      }

      const { data, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: code.replace(/\s/g, ''),
      });
      setVerifying(false);

      if (verifyError) {
        setVerifyAttempts((a) => a + 1);
        setError(verifyError.message);
        return;
      }

      setMessage('2FA enabled successfully! Make sure to keep your authenticator app safe.');
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      setCode('');
      setVerifyAttempts(0);
      loadFactors();
    } catch (err: any) {
      setVerifying(false);
      setError(err?.message || 'Verification failed. Please try again.');
    }
  };

  const handleUnenroll = async (id: string) => {
    setError('');
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (unenrollError) {
      setError(unenrollError.message);
      return;
    }
    setMessage('2FA disabled.');
    loadFactors();
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const isEnabled = factors.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEnabled ? <ShieldCheck className="h-5 w-5 text-green-600" /> : <Shield className="h-5 w-5" />}
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          {isEnabled
            ? 'Your account is protected with 2FA.'
            : 'Add an extra layer of security to your account.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {isEnabled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Authenticator App</p>
                <p className="text-sm text-muted-foreground">{factors[0].friendly_name || 'TOTP'}</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => handleUnenroll(factors[0].id)}>
                Disable
              </Button>
            </div>
          </div>
        ) : qrCode ? (
          <div className="space-y-4">
            <p className="text-sm">Scan this QR code with your authenticator app:</p>
            <div className="flex justify-center">
              <img src={qrCode} alt="TOTP QR Code" className="h-48 w-48" />
            </div>
            {secret && (
              <div className="flex items-center gap-2 justify-center">
                <code className="text-xs bg-muted px-2 py-1 rounded">{secret}</code>
                <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(secret)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter 6-digit code</label>
              <div className="flex gap-2">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && code.length === 6) {
                      e.preventDefault();
                      handleVerify();
                    }
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="max-w-[120px]"
                />
                <Button onClick={handleVerify} disabled={verifying || code.length < 6}>
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use an authenticator app like Google Authenticator or Authy to generate verification codes.
            </p>
            <Button onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enable 2FA
            </Button>
          </div>
        )}

        {verifyAttempts > 0 && verifyAttempts < 5 && (
          <p className="text-sm text-amber-600">
            Failed attempts: {verifyAttempts}/5
          </p>
        )}
      </CardContent>
    </Card>
  );
}
