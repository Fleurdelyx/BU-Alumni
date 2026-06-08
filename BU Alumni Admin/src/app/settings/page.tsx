'use client';

export const dynamic = 'force-dynamic';

import { AdminLayout } from '@/components/admin-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { AppearanceForm } from './_components/appearance-form';
import { AccountForm } from './_components/account-form';
import { SecurityForm } from './_components/security-form';

export default function SettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold font-display text-forest dark:text-sidebar-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your admin portal settings and preferences.
          </p>
        </div>
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <TabsContent value="appearance">
            <AppearanceForm />
          </TabsContent>
          <TabsContent value="account">
            <AccountForm />
          </TabsContent>
          <TabsContent value="security">
            <SecurityForm />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
