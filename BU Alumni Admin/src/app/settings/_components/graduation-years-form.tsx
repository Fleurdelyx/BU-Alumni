'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, CalendarRange } from 'lucide-react';

const DEFAULT_MIN = 1950;

export function GraduationYearsForm() {
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentYear = new Date().getFullYear();
  const [minYear, setMinYear] = useState<number>(DEFAULT_MIN);
  const [maxYear, setMaxYear] = useState<number>(currentYear);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('graduation_year_min, graduation_year_max')
        .eq('id', 1)
        .single();
      if (!error && data) {
        setMinYear(data.graduation_year_min ?? DEFAULT_MIN);
        setMaxYear(data.graduation_year_max ?? currentYear);
      }
      setLoading(false);
    }
    loadSettings();
  }, [supabase, currentYear]);

  const handleSave = async () => {
    const min = Number(minYear);
    const max = Number(maxYear);

    if (Number.isNaN(min) || Number.isNaN(max)) {
      toast({ title: 'Invalid year', description: 'Please enter numeric years.', variant: 'destructive' });
      return;
    }
    if (min >= max) {
      toast({ title: 'Invalid range', description: 'Minimum year must be less than maximum year.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: 1,
        graduation_year_min: min,
        graduation_year_max: max,
        updated_at: new Date().toISOString(),
      });
    setSaving(false);
    if (error) {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Graduation year range saved successfully' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-mist/60 dark:border-sidebar-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-forest dark:text-sidebar-foreground">
            <CalendarRange className="h-5 w-5 text-primary" />
            Graduation Year Range
          </CardTitle>
          <CardDescription>
            Set the minimum and maximum years shown in the "Year Graduated" and "Batch Year" dropdowns across the alumni web and mobile apps.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="grad-year-min">Minimum Year</Label>
              <Input
                id="grad-year-min"
                type="number"
                value={minYear}
                onChange={(e) => setMinYear(Number(e.target.value))}
                placeholder="1950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grad-year-max">Maximum Year</Label>
              <Input
                id="grad-year-max"
                type="number"
                value={maxYear}
                onChange={(e) => setMaxYear(Number(e.target.value))}
                placeholder={String(currentYear)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-mist/60 p-4 bg-muted/30">
            <p className="text-sm font-medium">Current range</p>
            <p className="text-sm text-muted-foreground">
              Users will see years from <strong>{minYear}</strong> to <strong>{maxYear}</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
