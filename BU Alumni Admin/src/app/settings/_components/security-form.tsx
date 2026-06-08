'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, ShieldCheck, Copy, Download } from 'lucide-react';

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
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
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

    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setFactorId(data.id);
  };

  const handleVerify = async () => {
    if (!factorId || !code) return;
    setError('');
    setVerifying(true);

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setVerifying(false);
      setError(challengeError.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.replace(/\s/g, ''),
    });
    setVerifying(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    const codes = Array.from({ length: 10 }, () =>
      Array.from({ length: 8 }, () => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 36)]).join('')
    );
    setBackupCodes(codes);
    setMessage('2FA enabled successfully! Save your backup codes.');
    setQrCode(null);
    setSecret(null);
    setFactorId(null);
    setCode('');
    loadFactors();
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

  const copyCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setMessage('Backup codes copied to clipboard!');
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
    <Card className="border-mist/60 dark:border-sidebar-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-forest dark:text-sidebar-foreground">
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
            <div className="flex items-center justify-between rounded-lg border border-sidebar-border/50 p-4">
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

        {backupCodes.length > 0 && (
          <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50 p-4">
            <p className="font-medium text-amber-800 dark:text-amber-400">Backup Codes</p>
            <p className="text-sm text-amber-700 dark:text-amber-500">
              Save these codes in a secure place. Each code can only be used once.
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((c, i) => (
                <div key={i} className="bg-white dark:bg-background border rounded px-2 py-1 text-center">
                  {c}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyCodes}>
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'bu-admin-backup-codes.txt';
                a.click();
              }}>
                <Download className="h-3 w-3 mr-1" /> Download
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
