'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import {
  FileText,
  Search,
  GraduationCap,
  FileDown,
  Briefcase,
  BookOpen,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/app-layout';
import { DegreeChart, EmploymentChart } from './_components/charts';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Profile, GtsResponse, ForumThread } from '@/lib/types';

export default function DashboardPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    employed: 0,
    unemployed: 0,
    furtherStudy: 0,
  });
  const [degreeData, setDegreeData] = useState<{ degree: string; total: number }[]>(
    []
  );
  const [employmentData, setEmploymentData] = useState<
    { name: string; value: number }[]
  >([]);
  const [recentThreads, setRecentThreads] = useState<ForumThread[]>([]);
  const [surveyStatus, setSurveyStatus] = useState<GtsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(prof);

      // Total respondents
      const { count: totalCount } = await supabase
        .from('gts_responses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted');

      // Employment stats
      let employed = 0;
      let unemployed = 0;
      let furtherStudy = 0;
      const empChartCounts: Record<string, number> = {};

      const { data: empRows, error: empError } = await supabase
        .from('gts_employment')
        .select('status');

      if (!empError && empRows) {
        empRows.forEach((row: any) => {
          const s = (row.status || '').toLowerCase();
          if (s.includes('further') || s.includes('study')) {
            furtherStudy++;
          } else if (s.includes('unemployed') || s.includes('never')) {
            unemployed++;
          } else if (s.includes('employed') || s.includes('self')) {
            employed++;
          }

          const name = row.status || 'Unknown';
          empChartCounts[name] = (empChartCounts[name] || 0) + 1;
        });
      }

      setStats({
        total: totalCount || 0,
        employed,
        unemployed,
        furtherStudy,
      });

      setEmploymentData(
        Object.entries(empChartCounts).map(([name, value]) => ({
          name,
          value,
        }))
      );

      // Respondents by degree
      const degreeCounts: Record<string, number> = {};
      const { data: degreeRows, error: degreeError } = await supabase
        .from('gts_responses')
        .select('profiles(degree)')
        .eq('status', 'submitted');

      if (!degreeError && degreeRows) {
        degreeRows.forEach((row: any) => {
          const deg = row.profiles?.degree || 'Unknown';
          degreeCounts[deg] = (degreeCounts[deg] || 0) + 1;
        });
      }

      setDegreeData(
        Object.entries(degreeCounts)
          .map(([degree, total]) => ({ degree, total }))
          .sort((a, b) => b.total - a.total)
      );

      // Recent forum threads
      const { data: threads } = await supabase
        .from('forum_threads')
        .select(
          '*, author:profiles(full_name, avatar_url), category:forum_categories(name)'
        )
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentThreads(threads || []);

      // Survey status
      const { data: response } = await supabase
        .from('gts_responses')
        .select('*, questionnaire:questionnaires(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setSurveyStatus(response);

      setLoading(false);
    }

    load();
  }, [supabase]);

  const handleExport = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: 'Not authenticated', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/export-csv`,
        {
          headers: { Authorization: `Bearer ${session.access_token}` },
        }
      );
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BU_Alumni_Tracer_Data_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'CSV exported successfully' });
    } catch (e) {
      toast({
        title: 'Export failed',
        description: String(e),
        variant: 'destructive',
      });
    }
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
      <div className="space-y-8">
        {/* Welcome banner */}
        <div className="rounded-xl bg-gradient-to-r from-forest to-emerald p-6 text-white">
          <h1 className="text-2xl font-bold font-display">
            Welcome back, {profile?.full_name || 'Alumni'}!
          </h1>
          <p className="text-white/80 mt-1">
            Here&apos;s what&apos;s happening in the BU Alumni Tracer Study.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate">
                Total Respondents
              </CardTitle>
              <UserCheck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate">
                Employed
              </CardTitle>
              <Briefcase className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.employed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate">
                Unemployed
              </CardTitle>
              <Search className="h-4 w-4 text-error" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unemployed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate">
                Further Study
              </CardTitle>
              <BookOpen className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.furtherStudy}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold font-display">
                Respondents by Degree
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DegreeChart data={degreeData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold font-display">
                Employment Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmploymentChart data={employmentData} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Survey Status */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold font-display">
                Recent Forum Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentThreads.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No forum activity yet.
                </p>
              ) : (
                recentThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {thread.title}
                      </p>
                      <p className="text-xs text-slate mt-0.5">
                        by {thread.author?.full_name || 'Unknown'} in{' '}
                        {thread.category?.name || 'General'}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {thread.reply_count} replies
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold font-display">
                  Survey Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {surveyStatus ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          surveyStatus.status === 'submitted'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {surveyStatus.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {surveyStatus.submitted_at
                          ? new Date(
                              surveyStatus.submitted_at
                            ).toLocaleDateString()
                          : 'Not submitted'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {(surveyStatus as any).questionnaire?.title ||
                        'Current questionnaire'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      You haven&apos;t started the tracer study yet.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => (window.location.href = '/survey')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Start Survey
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold font-display">
                  Export Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={handleExport} className="w-full">
                  <FileDown className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
