'use client';

import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
}

const RULES = [
  { label: '8+ characters', test: (pw: string) => pw.length >= 8 },
  { label: 'Uppercase letter (A–Z)', test: (pw: string) => /[A-Z]/.test(pw) },
  { label: 'Lowercase letter (a–z)', test: (pw: string) => /[a-z]/.test(pw) },
  { label: 'One number (0–9)', test: (pw: string) => /[0-9]/.test(pw) },
  { label: 'One special character', test: (pw: string) => /[^a-zA-Z0-9]/.test(pw) },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const score = useMemo(() => {
    return RULES.filter((r) => r.test(password)).length;
  }, [password]);

  const { label, color } = useMemo(() => {
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { label: 'Strong', color: 'bg-lime-500' };
    return { label: 'Secure', color: 'bg-green-600' };
  }, [score]);

  const progressValue = (score / RULES.length) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Strength:</span>
        <span className={cn('font-medium', score <= 1 && 'text-red-500', score === 2 && 'text-amber-500', score === 3 && 'text-lime-600', score >= 4 && 'text-green-600')}>
          {label}
        </span>
      </div>
      <Progress value={progressValue} className="h-1.5" />
      <ul className="space-y-1">
        {RULES.map((rule) => {
          const pass = rule.test(password);
          return (
            <li key={rule.label} className={cn('flex items-center gap-1.5 text-xs', pass ? 'text-green-600' : 'text-muted-foreground')}>
              {pass ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
