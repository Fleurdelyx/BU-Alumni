'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef, useMemo } from 'react';
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/components/profile-context';
import { Loader2, Upload, FileText, MessageSquare } from 'lucide-react';
import type { ForumThread, GtsResponse } from '@/lib/types';

const COLLEGES = [
  'College of Liberal Arts and General Education (CLAGE)',
  'College of Business Administration and Accountancy (CBAA)',
  'College of Education and Human Development (CEHD)',
  'College of Environmental Design and Engineering (CEDE)',
  'College of Nursing and Allied Health Sciences (CNAHS)',
  'College of Information Technology Education (CITE)',
  'College of Hospitality Management and Tourism (CHMT)',
  'School of Graduate Studies',
];

const COURSES_BY_COLLEGE: Record<string, string[]> = {
  'College of Liberal Arts and General Education (CLAGE)': [
    'Bachelor of Arts in Communication',
    'Bachelor of Arts in Communication and Bachelor of Arts in Journalism',
    'Bachelor of Arts in Political Science',
  ],
  'College of Business Administration and Accountancy (CBAA)': [
    'Bachelor of Science in Accountancy',
    'Bachelor of Science in Management Accounting',
    'Bachelor of Science in Business Administration',
  ],
  'College of Education and Human Development (CEHD)': [
    'Bachelor of Early Childhood Education',
    'Bachelor of Elementary Education',
    'Bachelor of Secondary Education',
    'Bachelor of Physical Education',
    'Bachelor of Library and Information Science',
    'Bachelor of Science in Psychology',
    'Bachelor of Science in Social Work',
    'Certificate in Teacher Education',
    'Post-Baccalaureate Diploma in Alternative Learning System',
  ],
  'College of Environmental Design and Engineering (CEDE)': [
    'Bachelor of Science in Civil Engineering',
    'Bachelor of Science in Computer Engineering',
    'Bachelor of Science in Electrical Engineering',
    'Bachelor of Science in Electronics Engineering',
    'Bachelor of Science in Industrial Engineering',
    'Bachelor of Science in Mechanical Engineering',
  ],
  'College of Nursing and Allied Health Sciences (CNAHS)': [
    'Bachelor of Science in Nursing',
    'Bachelor of Science in Nutrition and Dietetics',
    'Bachelor of Science in Medical Technology/Medical Laboratory Science',
  ],
  'College of Information Technology Education (CITE)': [
    'Associate in Computer Technology',
    'Bachelor of Science in Computer Science',
    'Bachelor of Science in Information Technology',
  ],
  'College of Hospitality Management and Tourism (CHMT)': [
    'Bachelor of Science in Hospitality Management',
    'Bachelor of Science in Tourism Management',
  ],
  'School of Graduate Studies': [
    'Doctor of Education',
    'Doctor of Business Administration',
    'Master in Business Administration',
    'Master in Public Administration',
    'Master of Arts in Education',
    'Master of Science in Nursing',
  ],
};

export default function ProfilePage() {
  const supabase = createClient();
  const { toast } = useToast();
  const { profile, refreshProfile } = useProfile();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [responses, setResponses] = useState<GtsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    bio: '',
    batch_year: '',
    degree: '',
    college: '',
  });

  const availableDegrees = useMemo(() => {
    if (!form.college) return [];
    return COURSES_BY_COLLEGE[form.college] || [];
  }, [form.college]);

  // Sync form when context profile loads/changes
  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || '',
        middle_name: profile.middle_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        batch_year: profile.batch_year ? String(profile.batch_year) : '',
        degree: profile.degree || '',
        college: profile.college || '',
      });
    }
  }, [profile]);

  // Load threads and responses
  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) {
        setLoading(false);
        return;
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
      first_name: form.first_name,
      middle_name: form.middle_name || null,
      last_name: form.last_name,
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
      await refreshProfile();
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
      await refreshProfile();
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
      <div className="space-y-8 max-w-6xl mx-auto pt-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-forest dark:text-sidebar-foreground">
            Your Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your public profile and view your activity.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <Avatar className="h-24 w-24 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                  <AvatarImage
                    src={profile?.avatar_url || ''}
                    alt={profile?.display_name}
                  />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary font-display">
                    {profile?.display_name?.split(' ').map((n) => n[0]).join('') ||
                      'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
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
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG, GIF up to 5MB.
                  </p>
                </div>
              </div>

              {/* Names row */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={form.first_name}
                    onChange={(e) =>
                      setForm({ ...form, first_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middle_name">Middle Name</Label>
                  <Input
                    id="middle_name"
                    value={form.middle_name}
                    onChange={(e) =>
                      setForm({ ...form, middle_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={form.last_name}
                    onChange={(e) =>
                      setForm({ ...form, last_name: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Batch / College / Degree row */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="batch_year">Batch Year</Label>
                  <Input
                    id="batch_year"
                    type="number"
                    placeholder="e.g. 2020"
                    value={form.batch_year}
                    onChange={(e) =>
                      setForm({ ...form, batch_year: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Select
                    value={form.college}
                    onValueChange={(value) =>
                      setForm({ ...form, college: value, degree: '' })
                    }
                  >
                    <SelectTrigger id="college" className="w-full">
                      <SelectValue placeholder="Select college" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLLEGES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree</Label>
                  <Select
                    value={form.degree}
                    onValueChange={(value) =>
                      setForm({ ...form, degree: value })
                    }
                    disabled={!form.college || availableDegrees.length === 0}
                  >
                    <SelectTrigger id="degree" className="w-full">
                      <SelectValue
                        placeholder={
                          !form.college
                            ? 'Select college first'
                            : availableDegrees.length === 0
                              ? 'No degrees available'
                              : 'Select degree'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDegrees.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) =>
                    setForm({ ...form, bio: e.target.value })
                  }
                  rows={4}
                  placeholder="Tell us a little about yourself..."
                />
              </div>
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-6">
              <Button onClick={handleSave} disabled={saving} className="min-w-[140px]">
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
