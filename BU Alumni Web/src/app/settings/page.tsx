'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AppearanceForm } from './_components/appearance-form';
import { AccountForm } from './_components/account-form';
import { SecurityForm } from './_components/security-form';
import { Palette, Bell, User, Shield } from 'lucide-react';

function NotificationsForm() {
  const [prefs, setPrefs] = useState({
    email: true,
    push: true,
    announcements: true,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bu-notification-prefs');
      if (saved) {
        try {
          setPrefs(JSON.parse(saved));
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const updatePref = (key: keyof typeof prefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem('bu-notification-prefs', JSON.stringify(next));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to be notified.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive updates via email.
            </p>
          </div>
          <Switch
            checked={prefs.email}
            onCheckedChange={(v) => updatePref('email', v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive browser push notifications.
            </p>
          </div>
          <Switch
            checked={prefs.push}
            onCheckedChange={(v) => updatePref('push', v)}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Announcements</Label>
            <p className="text-sm text-muted-foreground">
              Get notified about system announcements.
            </p>
          </div>
          <Switch
            checked={prefs.announcements}
            onCheckedChange={(v) => updatePref('announcements', v)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto pt-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-forest dark:text-sidebar-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account settings and preferences.
          </p>
        </div>
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>
          <TabsContent value="appearance">
            <AppearanceForm />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsForm />
          </TabsContent>
          <TabsContent value="account">
            <AccountForm />
          </TabsContent>
          <TabsContent value="security">
            <SecurityForm />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
