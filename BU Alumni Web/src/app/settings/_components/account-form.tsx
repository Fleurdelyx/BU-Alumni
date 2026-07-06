'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail } from 'lucide-react';

export function AccountForm() {
  const supabase = createClient();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setCurrentEmail(user.email);
      }
    }
    loadUser();
  }, [supabase]);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({
        title: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password updated successfully' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setPasswordLoading(false);
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !confirmEmail) {
      toast({ title: 'Please fill in all email fields', variant: 'destructive' });
      return;
    }
    if (newEmail !== confirmEmail) {
      toast({ title: 'Email addresses do not match', variant: 'destructive' });
      return;
    }
    if (newEmail === currentEmail) {
      toast({ title: 'New email must be different from current email', variant: 'destructive' });
      return;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({ title: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }

    setEmailLoading(true);
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ 
        title: 'Email update initiated', 
        description: 'Please check both your old and new email addresses for confirmation links.' 
      });
      setNewEmail('');
      setConfirmEmail('');
    }
    setEmailLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Email Address
          </CardTitle>
          <CardDescription>Update your email address. You will need to confirm the change via links sent to both your old and new email addresses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-email">Current Email</Label>
            <Input
              id="current-email"
              type="email"
              value={currentEmail}
              disabled
              className="bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-email">New Email</Label>
            <Input
              id="new-email"
              type="email"
              placeholder="Enter new email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-email">Confirm New Email</Label>
            <Input
              id="confirm-email"
              type="email"
              placeholder="Confirm new email address"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleChangeEmail} disabled={emailLoading}>
            {emailLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Update Email
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Manage your account security.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button onClick={handleChangePassword} disabled={passwordLoading}>
            {passwordLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
