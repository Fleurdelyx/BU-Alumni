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
import { Loader2, Smartphone, Download, ExternalLink } from 'lucide-react';

const DEFAULT_APK_URL = 'https://drive.google.com/file/d/1mezf1st4huU0uwVjQKPu2p7B9OTKnzeg/view?usp=sharing';
const DEFAULT_VERSION = 'v1.1.0';

export function MobileAppForm() {
  const supabase = createClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [downloadUrl, setDownloadUrl] = useState(DEFAULT_APK_URL);
  const [version, setVersion] = useState(DEFAULT_VERSION);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('mobile_app_download_url, mobile_app_version')
        .eq('id', 1)
        .single();
      if (!error && data) {
        setDownloadUrl(data.mobile_app_download_url || DEFAULT_APK_URL);
        setVersion(data.mobile_app_version || DEFAULT_VERSION);
      }
      setLoading(false);
    }
    loadSettings();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: 1,
        mobile_app_download_url: downloadUrl.trim() || DEFAULT_APK_URL,
        mobile_app_version: version.trim() || DEFAULT_VERSION,
        updated_at: new Date().toISOString(),
      });
    setSaving(false);
    if (error) {
      toast({ title: 'Error saving settings', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Mobile app settings saved successfully' });
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
            <Smartphone className="h-5 w-5 text-primary" />
            Mobile App Download
          </CardTitle>
          <CardDescription>
            Configure the download link and version shown on the alumni portal mobile-app page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              APK Download URL
            </Label>
            <p className="text-sm text-muted-foreground">
              Public link to the latest Android APK. Google Drive direct or share links both work.
            </p>
            <Input
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder={DEFAULT_APK_URL}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Display Version
            </Label>
            <p className="text-sm text-muted-foreground">
              Version label shown next to the download button (e.g. v1.1.0).
            </p>
            <Input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder={DEFAULT_VERSION}
              className="font-mono text-sm"
            />
          </div>

          <div className="rounded-lg border border-mist/60 p-4 bg-muted/30">
            <p className="text-sm font-medium">Preview link</p>
            <a
              href={downloadUrl || DEFAULT_APK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline break-all"
            >
              {downloadUrl || DEFAULT_APK_URL}
            </a>
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
