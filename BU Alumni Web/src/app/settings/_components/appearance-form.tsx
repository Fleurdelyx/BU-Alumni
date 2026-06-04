'use client';

import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function AppearanceForm() {
  const { setTheme, theme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the look and feel of the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            <Label>Theme</Label>
             <p className="text-sm text-muted-foreground">Select the theme for the website.</p>
            <RadioGroup
                onValueChange={setTheme}
                defaultValue={theme}
                className="grid max-w-md grid-cols-3 gap-8 pt-2"
            >
                <Label className="[&:has([data-state=checked])>div]:border-primary">
                <RadioGroupItem value="light" className="sr-only" />
                <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                    <div className="space-y-2 rounded-sm bg-gray-200 p-2">
                    <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                        <div className="h-2 w-16 rounded-lg bg-[#CBD5E1]" />
                        <div className="h-2 w-20 rounded-lg bg-[#CBD5E1]" />
                    </div>
                    <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-[#CBD5E1]" />
                        <div className="h-2 w-20 rounded-lg bg-[#CBD5E1]" />
                    </div>
                    <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-[#CBD5E1]" />
                        <div className="h-2 w-20 rounded-lg bg-[#CBD5E1]" />
                    </div>
                    </div>
                </div>
                <span className="block w-full p-2 text-center font-normal">
                    Light
                </span>
                </Label>
                <Label className="[&:has([data-state=checked])>div]:border-primary">
                <RadioGroupItem value="dark" className="sr-only" />
                <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:border-accent">
                    <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                    <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                        <div className="h-2 w-16 rounded-lg bg-slate-400" />
                        <div className="h-2 w-20 rounded-lg bg-slate-400" />
                    </div>
                    <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-slate-400" />
                        <div className="h-2 w-20 rounded-lg bg-slate-400" />
                    </div>
                    <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                        <div className="h-4 w-4 rounded-full bg-slate-400" />
                        <div className="h-2 w-20 rounded-lg bg-slate-400" />
                    </div>
                    </div>
                </div>
                <span className="block w-full p-2 text-center font-normal">
                    Dark
                </span>
                </Label>
                <Label className="[&:has([data-state=checked])>div]:border-primary">
                    <RadioGroupItem value="system" className="sr-only" />
                    <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                        <div className="space-y-2 rounded-sm bg-gray-200 p-2 dark:bg-slate-950">
                        <div className="space-y-2 rounded-md bg-white p-2 shadow-sm dark:bg-slate-800">
                            <div className="h-2 w-16 rounded-lg bg-gray-300 dark:bg-slate-400" />
                            <div className="h-2 w-20 rounded-lg bg-gray-300 dark:bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm dark:bg-slate-800">
                            <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-slate-400" />
                            <div className="h-2 w-20 rounded-lg bg-gray-300 dark:bg-slate-400" />
                        </div>
                        <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm dark:bg-slate-800">
                            <div className="h-4 w-4 rounded-full bg-gray-300 dark:bg-slate-400" />
                            <div className="h-2 w-20 rounded-lg bg-gray-300 dark:bg-slate-400" />
                        </div>
                        </div>
                    </div>
                    <span className="block w-full p-2 text-center font-normal">
                        System
                    </span>
                </Label>
            </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
