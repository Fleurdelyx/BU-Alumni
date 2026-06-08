'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/stat-card';
import { Loader2, Users, FileText, MessageSquare, BarChart3, Settings, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const supabase = createClient();
  const [stats, setStats] = useState({
    users: 0,
    responses: 0,
    threads: 0,
    reports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [
        { count: users },
        { count: responses },
        { count: threads },
        { count: reports },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('gts_responses').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
        supabase.from('forum_threads').select('*', { count: 'exact', head: true }),
        supabase.from('forum_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);
      setStats({
        users: users || 0,
        responses: responses || 0,
        threads: threads || 0,
        reports: reports || 0,
      });
      setLoading(false);
    }
    load();
  }, [supabase]);

  const quickLinks = [
    { href: '/respondents', label: 'Respondents', icon: FileText, desc: 'View GTS submissions', accent: '#3B82F6', iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
    { href: '/analytics', label: 'Analytics', icon: BarChart3, desc: 'Insights & charts', accent: '#22C55E', iconColor: 'text-green-600', iconBg: 'bg-green-50' },
    { href: '/forum', label: 'Forum', icon: MessageSquare, desc: 'Moderation queue', accent: '#F59E0B', iconColor: 'text-amber-600', iconBg: 'bg-amber-50' },
    { href: '/users', label: 'Users', icon: Users, desc: 'Manage accounts', accent: '#8B5CF6', iconColor: 'text-purple-600', iconBg: 'bg-purple-50' },
    { href: '/settings', label: 'Settings', icon: Settings, desc: 'Portal settings', accent: '#64748B', iconColor: 'text-slate-600', iconBg: 'bg-slate-50' },
  ];

  const totalActivity = stats.users + stats.responses + stats.threads + stats.reports;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page header with subtle depth */}
        <div className="relative">
          <h1 className="text-3xl font-bold font-display text-forest dark:text-sidebar-foreground tracking-tight">Dashboard</h1>
          <p className="text-slate mt-2 text-sm max-w-lg">
            Overview of the BU Alumni Tracer Study platform. Monitor users, survey responses, forum activity, and moderation tasks.
          </p>
        </div>

        {/* Stats with mini bars */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats.users}
            icon={Users}
            iconColor="text-primary"
            iconBg="bg-primary/10"
            accentColor="#4C992D"
            miniBarValue={totalActivity > 0 ? (stats.users / totalActivity) * 100 : 0}
            miniBarColor="#4C992D"
            delay={0}
          />
          <StatCard
            title="Submitted Responses"
            value={stats.responses}
            icon={FileText}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            accentColor="#3B82F6"
            miniBarValue={totalActivity > 0 ? (stats.responses / totalActivity) * 100 : 0}
            miniBarColor="#3B82F6"
            delay={100}
          />
          <StatCard
            title="Forum Threads"
            value={stats.threads}
            icon={MessageSquare}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            accentColor="#F59E0B"
            miniBarValue={totalActivity > 0 ? (stats.threads / totalActivity) * 100 : 0}
            miniBarColor="#F59E0B"
            delay={200}
          />
          <StatCard
            title="Pending Reports"
            value={stats.reports}
            icon={ShieldAlert}
            iconColor="text-red-500"
            iconBg="bg-red-50"
            accentColor="#EF4444"
            miniBarValue={totalActivity > 0 ? (stats.reports / totalActivity) * 100 : 0}
            miniBarColor="#EF4444"
            delay={300}
          />
        </div>

        {/* Quick Links with depth */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Access</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <Card className="relative overflow-hidden border-mist/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full group">
                    {/* Top accent */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(90deg, ${link.accent}, ${link.accent}66)` }}
                    />
                    <CardContent className="p-5 flex items-start gap-4">
                      <div
                        className={`h-11 w-11 rounded-xl flex items-center justify-center ${link.iconBg} shadow-inner ring-1 ring-black/5`}
                      >
                        <Icon className={`h-5 w-5 ${link.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-card-foreground text-sm">{link.label}</h3>
                          <ArrowRight className="h-3.5 w-3.5 text-slate opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </div>
                        <p className="text-xs text-slate mt-0.5">{link.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
