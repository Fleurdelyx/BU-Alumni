'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Loader2, UserCheck, Briefcase, Search, BookOpen, TrendingUp, DollarSign, Factory } from 'lucide-react';
import { StatCard } from '@/components/stat-card';
import { AnimatedChartWrapper } from '@/components/animated-chart-wrapper';
import { DegreeChart, EmploymentChart, ProgramTrendChart, SalaryByProgramChart, IndustryChart } from './_components/charts';

type DegreeRow = {
  degree_name: string;
  year_graduated: number | null;
  response_id: string;
};

type EmploymentRow = {
  response_id: string;
  employment_status: string | null;
  major_line_of_business: string | null;
  initial_monthly_earning: string | null;
};

function parseSalary(text: string | null): number | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  const numbers = text.match(/[\d,]+(?:\.\d+)?/g);
  if (!numbers || numbers.length === 0) return null;
  const values = numbers.map((n) => parseFloat(n.replace(/,/g, ''))).filter((n) => !isNaN(n));
  if (values.length === 0) return null;

  if (values.length >= 2) {
    return (values[0] + values[1]) / 2;
  }
  const single = values[0];
  if (lower.includes('below') || lower.includes('under') || lower.includes('less than')) {
    return single * 0.75;
  }
  if (lower.includes('above') || lower.includes('over') || lower.includes('more than')) {
    return single * 1.25;
  }
  return single;
}

export default function AnalyticsPage() {
  const supabase = createClient();
  const [degreeData, setDegreeData] = useState<{ degree: string; total: number }[]>([]);
  const [employmentData, setEmploymentData] = useState<{ name: string; value: number }[]>([]);
  const [degreeRows, setDegreeRows] = useState<DegreeRow[]>([]);
  const [employmentRows, setEmploymentRows] = useState<EmploymentRow[]>([]);
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
        { data: degRows },
      ] = await Promise.all([
        supabase.from('gts_responses').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
        supabase.from('gts_employment').select('response_id, employment_status, major_line_of_business, initial_monthly_earning'),
        supabase.from('gts_degrees').select('degree_name, year_graduated, response_id').order('year_graduated', { ascending: true }),
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

      // Filter degrees/employment to submitted responses only
      const { data: submittedIds } = await supabase
        .from('gts_responses')
        .select('id')
        .eq('status', 'submitted');
      const submittedSet = new Set((submittedIds || []).map((r: any) => r.id));

      const filteredDegrees = (degRows || []).filter((d: any) => submittedSet.has(d.response_id)) as DegreeRow[];
      const filteredEmployment = (empRows || []).filter((e: any) => submittedSet.has(e.response_id)) as EmploymentRow[];

      setDegreeRows(filteredDegrees);
      setEmploymentRows(filteredEmployment);

      const degreeCounts: Record<string, number> = {};
      filteredDegrees.forEach((row) => {
        const deg = row.degree_name || 'Unknown';
        degreeCounts[deg] = (degreeCounts[deg] || 0) + 1;
      });

      setDegreeData(
        Object.entries(degreeCounts)
          .map(([degree, total]) => ({ degree, total }))
          .sort((a, b) => b.total - a.total)
      );

      setLoading(false);
    }
    load();
  }, [supabase]);

  const programTrend = useMemo(() => {
    const degreeCounts: Record<string, number> = {};
    degreeRows.forEach((row) => {
      const deg = row.degree_name || 'Unknown';
      degreeCounts[deg] = (degreeCounts[deg] || 0) + 1;
    });
    const topPrograms = Object.entries(degreeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const yearsSet = new Set<number>();
    degreeRows.forEach((row) => {
      if (row.year_graduated) yearsSet.add(row.year_graduated);
    });
    const years = Array.from(yearsSet).sort();
    if (years.length === 0) return { data: [], programs: [] };

    const data = years.map((year) => {
      const point: Record<string, string | number> = { year: String(year) };
      topPrograms.forEach((program) => {
        point[program] = degreeRows.filter(
          (row) => row.degree_name === program && row.year_graduated === year
        ).length;
      });
      return point;
    });

    return { data, programs: topPrograms };
  }, [degreeRows]);

  const salaryByProgram = useMemo(() => {
    const programSalaries: Record<string, number[]> = {};
    employmentRows.forEach((row) => {
      const salary = parseSalary(row.initial_monthly_earning);
      if (!salary) return;
      const program = degreeRows.find((d) => d.response_id === row.response_id)?.degree_name || 'Unknown';
      if (!programSalaries[program]) programSalaries[program] = [];
      programSalaries[program].push(salary);
    });

    return Object.entries(programSalaries)
      .map(([program, salaries]) => ({
        program,
        average: Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length),
        count: salaries.length,
      }))
      .filter((item) => item.count >= 1)
      .sort((a, b) => b.average - a.average)
      .slice(0, 10);
  }, [employmentRows, degreeRows]);

  const industryData = useMemo(() => {
    const counts: Record<string, number> = {};
    employmentRows.forEach((row) => {
      const industry = row.major_line_of_business || 'Unknown';
      counts[industry] = (counts[industry] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [employmentRows]);

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
            Deep insights from tracer study data. Track employment outcomes, degree distributions, program trends, salaries, and industry preferences.
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

        {/* Degree + Employment */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <AnimatedChartWrapper delay={400}>
            <Card className="border-mist/60 shadow-sm overflow-hidden">
              <div className="h-[3px] w-full bg-gradient-to-r from-primary/60 via-meadow/60 to-primary/20" />
              <CardHeader className="pb-2">
                <CardTitle className="text-card-foreground font-semibold">Respondents by Degree</CardTitle>
                <CardDescription>Distribution of responses across degree programs.</CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
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
              <CardContent className="pb-6">
                <EmploymentChart data={employmentData} />
              </CardContent>
            </Card>
          </AnimatedChartWrapper>
        </div>

        {/* Labor market intelligence */}
        <div>
          <h2 className="text-xl font-bold font-display text-forest dark:text-sidebar-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Labor Market Intelligence
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <AnimatedChartWrapper delay={600}>
              <Card className="border-mist/60 shadow-sm overflow-hidden">
                <div className="h-[3px] w-full bg-gradient-to-r from-blue-500/60 via-cyan-400/40 to-blue-500/20" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-card-foreground font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Trending Programs by Year
                  </CardTitle>
                  <CardDescription>Top 5 degree programs and how their graduating classes trend over the years.</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <ProgramTrendChart data={programTrend.data} programs={programTrend.programs} />
                </CardContent>
              </Card>
            </AnimatedChartWrapper>

            <AnimatedChartWrapper delay={700}>
              <Card className="border-mist/60 shadow-sm overflow-hidden">
                <div className="h-[3px] w-full bg-gradient-to-r from-amber-500/60 via-yellow-400/40 to-amber-500/20" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-card-foreground font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-amber-500" />
                    Average Salary by Program
                  </CardTitle>
                  <CardDescription>Initial monthly earnings averaged by degree program.</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <SalaryByProgramChart data={salaryByProgram} />
                </CardContent>
              </Card>
            </AnimatedChartWrapper>

            <AnimatedChartWrapper delay={800} className="lg:col-span-2">
              <Card className="border-mist/60 shadow-sm overflow-hidden">
                <div className="h-[3px] w-full bg-gradient-to-r from-purple-500/60 via-violet-400/40 to-purple-500/20" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-card-foreground font-semibold flex items-center gap-2">
                    <Factory className="h-4 w-4 text-purple-500" />
                    Industries Alumni Gravitate To
                  </CardTitle>
                  <CardDescription>Distribution of alumni by major line of business / industry.</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <IndustryChart data={industryData} />
                </CardContent>
              </Card>
            </AnimatedChartWrapper>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
