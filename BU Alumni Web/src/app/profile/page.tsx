'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from 'react';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, FileText, MessageSquare } from 'lucide-react';
import type { Profile, ForumThread, GtsResponse } from '@/lib/types';

export default function ProfilePage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [responses, setResponses] = useState<GtsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    batch_year: '',
    degree: '',
    college: '',
  });

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (prof) {
        setProfile(prof);
        setForm({
          full_name: prof.full_name || '',
          bio: prof.bio || '',
          batch_year: prof.batch_year ? String(prof.batch_year) : '',
          degree: prof.degree || '',
          college: prof.college || '',
        });
      }

      const { data: t } = await supabase
        .from('forum_threads')
        .select('*, category:forum_categories(name)')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });
      setThreads(t || []);

      const { data: r } = await supabase
        .from('gts_responses')
        .select('*, questionnaire:questionnaires(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setResponses(r || []);

      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleSave = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const updates = {
      full_name: form.full_name,
      bio: form.bio || null,
      batch_year: form.batch_year ? parseInt(form.batch_year) : null,
      degree: form.degree || null,
      college: form.college || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    if (error) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Profile updated successfully' });
      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError.message,
        variant: 'destructive',
      });
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      toast({
        title: 'Error saving avatar',
        description: updateError.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Avatar updated' });
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold font-display text-forest">
            Your Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your public profile and view your activity.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={profile?.avatar_url || ''}
                    alt={profile?.full_name}
                  />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {profile?.full_name?.split(' ').map((n) => n[0]).join('') ||
                      'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Change Avatar
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, GIF up to 5MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({ ...form, full_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch_year">Batch Year</Label>
                  <Input
                    id="batch_year"
                    type="number"
                    value={form.batch_year}
                    onChange={(e) =>
                      setForm({ ...form, batch_year: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Input
                    id="degree"
                    value={form.degree}
                    onChange={(e) =>
                      setForm({ ...form, degree: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Input
                    id="college"
                    value={form.college}
                    onChange={(e) =>
                      setForm({ ...form, college: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) =>
                      setForm({ ...form, bio: e.target.value })
                    }
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Survey Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {responses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No survey responses yet.
                  </p>
                ) : (
                  responses.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {(r as any).questionnaire?.title || 'Questionnaire'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.submitted_at
                            ? `Submitted ${new Date(r.submitted_at).toLocaleDateString()}`
                            : 'Draft'}
                        </p>
                      </div>
                      <Badge
                        variant={r.status === 'submitted' ? 'default' : 'secondary'}
                      >
                        {r.status}
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Forum Posts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {threads.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No forum posts yet.
                  </p>
                ) : (
                  threads.map((t) => (
                    <div key={t.id} className="rounded-lg border p-3">
                      <p className="text-sm font-medium line-clamp-1">
                        {t.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        in {(t as any).category?.name || 'General'} ·{' '}
                        {t.reply_count} replies
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
