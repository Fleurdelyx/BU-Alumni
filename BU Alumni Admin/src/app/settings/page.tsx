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
import { ChatbotForm } from './_components/chatbot-form';
import { MobileAppForm } from './_components/mobile-app-form';
import { GraduationYearsForm } from './_components/graduation-years-form';

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
            <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
            <TabsTrigger value="mobile">Mobile App</TabsTrigger>
            <TabsTrigger value="graduation">Graduation Years</TabsTrigger>
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
          <TabsContent value="chatbot">
            <ChatbotForm />
          </TabsContent>
          <TabsContent value="mobile">
            <MobileAppForm />
          </TabsContent>
          <TabsContent value="graduation">
            <GraduationYearsForm />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
