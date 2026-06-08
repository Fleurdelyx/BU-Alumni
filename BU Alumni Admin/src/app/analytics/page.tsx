'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Loader2, UserCheck, Briefcase, Search, BookOpen } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { AnimatedChartWrapper } from '@/components/animated-chart-wrapper';
import { DegreeChart, EmploymentChart } from './_components/charts';

export default function AnalyticsPage() {
  const supabase = createClient();
  const [degreeData, setDegreeData] = useState<{ degree: string; total: number }[]>([]);
  const [employmentData, setEmploymentData] = useState<{ name: string; value: number }[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    employed: 0,
    unemployed: 0,
    furtherStudy: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        { count: totalCount },
        { data: empRows },
        { data: degreeRows },
      ] = await Promise.all([
        supabase
          .from('gts_responses')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'submitted'),
        supabase.from('gts_employment').select('presently_employed, employment_status'),
        supabase
          .from('gts_responses')
          .select('profiles(degree)')
          .eq('status', 'submitted'),
      ]);

      let employed = 0;
      let unemployed = 0;
      let furtherStudy = 0;
      const empChartCounts: Record<string, number> = {};

      if (empRows) {
        empRows.forEach((row: any) => {
          const pe = (row.presently_employed || '').toLowerCase();
          const es = (row.employment_status || '').toLowerCase();

          if (pe === 'yes' || es.includes('self-employed') || es.includes('regular') || es.includes('permanent') || es.includes('temporary') || es.includes('contractual') || es.includes('casual')) {
            employed++;
          } else if (pe === 'no' || pe.includes('never')) {
            unemployed++;
          }

          if (es.includes('further') || es.includes('study')) {
            furtherStudy++;
          }

          const name = row.employment_status || row.presently_employed || 'Unknown';
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

      const degreeCounts: Record<string, number> = {};
      if (degreeRows) {
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

      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const totalRespondents = stats.total || 1;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display text-forest dark:text-sidebar-foreground tracking-tight">Analytics</h1>
          <p className="text-slate mt-2 text-sm max-w-lg">
            Deep insights from tracer study data. Track employment outcomes, degree distributions, and response trends.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Respondents"
            value={stats.total}
            icon={UserCheck}
            iconColor="text-primary"
            iconBg="bg-primary/10"
            accentColor="#4C992D"
            miniBarValue={100}
            miniBarColor="#4C992D"
            delay={0}
          />
          <StatCard
            title="Employed"
            value={stats.employed}
            icon={Briefcase}
            iconColor="text-green-600"
            iconBg="bg-green-50"
            accentColor="#22C55E"
            miniBarValue={(stats.employed / totalRespondents) * 100}
            miniBarColor="#22C55E"
            delay={100}
          />
          <StatCard
            title="Unemployed"
            value={stats.unemployed}
            icon={Search}
            iconColor="text-red-500"
            iconBg="bg-red-50"
            accentColor="#EF4444"
            miniBarValue={(stats.unemployed / totalRespondents) * 100}
            miniBarColor="#EF4444"
            delay={200}
          />
          <StatCard
            title="Further Study"
            value={stats.furtherStudy}
            icon={BookOpen}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            accentColor="#3B82F6"
            miniBarValue={(stats.furtherStudy / totalRespondents) * 100}
            miniBarColor="#3B82F6"
            delay={300}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <AnimatedChartWrapper delay={400}>
            <Card className="border-mist/60 shadow-sm overflow-hidden">
              <div className="h-[3px] w-full bg-gradient-to-r from-primary/60 via-meadow/60 to-primary/20" />
              <CardHeader className="pb-2">
                <CardTitle className="text-card-foreground font-semibold">Respondents by Degree</CardTitle>
                <CardDescription>Distribution of responses across degree programs.</CardDescription>
              </CardHeader>
              <CardContent>
                <DegreeChart data={degreeData} />
              </CardContent>
            </Card>
          </AnimatedChartWrapper>

          <AnimatedChartWrapper delay={550}>
            <Card className="border-mist/60 shadow-sm overflow-hidden">
              <div className="h-[3px] w-full bg-gradient-to-r from-green-500/60 via-emerald-400/40 to-green-500/20" />
              <CardHeader className="pb-2">
                <CardTitle className="text-card-foreground font-semibold">Employment Status</CardTitle>
                <CardDescription>Current employment breakdown.</CardDescription>
              </CardHeader>
              <CardContent>
                <EmploymentChart data={employmentData} />
              </CardContent>
            </Card>
          </AnimatedChartWrapper>
        </div>
      </div>
    </AdminLayout>
  );
}
