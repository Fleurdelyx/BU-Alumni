'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import {
  FileText,
  MessageSquare,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Circle,
  TrendingUp,
  Users,
  Award,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import type { Profile, GtsResponse, ForumThread } from '@/lib/types';
import Link from 'next/link';
import { motion } from 'framer-motion';

/* ─── Floating Orb ─── */
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-15 pointer-events-none ${className}`}
      animate={{ y: [0, -25, 0], x: [0, 12, 0], scale: [1, 1.08, 1] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

/* ─── Staggered container ─── */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentThreads, setRecentThreads] = useState<ForumThread[]>([]);
  const [surveyStatus, setSurveyStatus] = useState<GtsResponse | null>(null);
  const [loading, setLoading] = useState(true);

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

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(prof);

      const { data: threads } = await supabase
        .from('forum_threads')
        .select(
          '*, author:profiles(full_name, avatar_url), category:forum_categories(name, slug)'
        )
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentThreads(threads || []);

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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const hasSubmitted = surveyStatus?.status === 'submitted';

  return (
    <AppLayout>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8 max-w-7xl mx-auto pt-4"
      >
        {/* ─── Welcome Hero ─── */}
        <motion.div variants={item} className="relative rounded-3xl overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald via-primary to-meadow" />
          <FloatingOrb className="w-[400px] h-[400px] bg-meadow/40 -top-40 -right-20" delay={0} />
          <FloatingOrb className="w-[300px] h-[300px] bg-[hsl(0_0%_100%_/_0.1)] bottom-0 left-1/4" delay={2} />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="relative p-8 sm:p-10 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium mb-3 dark:bg-black/10 dark:border-black/10"
                >
                  <Award className="h-3.5 w-3.5" />
                  Alumni Portal
                </motion.div>
                <h1 className="text-3xl sm:text-4xl font-bold font-display leading-tight">
                  Welcome back, <br className="sm:hidden" />
                  <span className="text-mint">{profile?.full_name?.split(' ')[0] || 'Alumni'}!</span>
                </h1>
                <p className="text-white/70 mt-2 max-w-md text-sm leading-relaxed">
                  Your input helps shape the future of Baliuag University. Track your journey, connect with peers, and grow with the community.
                </p>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="hidden sm:flex h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 dark:bg-black/10 dark:border-black/10 items-center justify-center shrink-0"
              >
                <img src="/logos/bu.png" alt="BU" className="h-14 w-14 object-contain opacity-90" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ─── Quick Stats ─── */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: FileText, label: 'Survey', value: hasSubmitted ? 'Completed' : 'Pending', color: hasSubmitted ? 'text-green-600' : 'text-amber-600', bg: hasSubmitted ? 'bg-green-50' : 'bg-amber-50' },
            { icon: MessageSquare, label: 'Forum Posts', value: 'Active', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Users, label: 'Network', value: 'Growing', color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: Calendar, label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).getFullYear().toString() : '—', color: 'text-primary', bg: 'bg-primary/10' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-2xl bg-card border border-mist/40 dark:border-sidebar-border/30 p-4 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className={`h-9 w-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="h-4.5 w-4.5" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</p>
              <p className="text-lg font-display font-bold text-card-foreground mt-0.5">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Primary CTA — Survey ─── */}
        <motion.div variants={item}>
          <Card
            className={`relative overflow-hidden rounded-2xl border-mist/50 dark:border-sidebar-border/30 shadow-sm hover:shadow-xl transition-all duration-500 ${
              hasSubmitted ? 'border-green-200/60 dark:border-green-900/40 bg-green-50/40 dark:bg-green-950/20' : 'bg-card'
            }`}
          >
            <div
              className={`absolute top-0 left-0 right-0 h-[3px] ${
                hasSubmitted
                  ? 'bg-gradient-to-r from-green-500/70 to-green-300/30'
                  : 'bg-gradient-to-r from-primary via-meadow to-primary/40'
              }`}
            />
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.05 }}
                    className={`h-14 w-14 rounded-xl flex items-center justify-center shrink-0 shadow-inner ring-1 ring-black/5 ${
                      hasSubmitted ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {hasSubmitted ? <CheckCircle2 className="h-7 w-7" /> : <FileText className="h-7 w-7" />}
                  </motion.div>
                  <div>
                    <h2 className="text-xl font-bold font-display text-card-foreground">
                      {hasSubmitted ? 'Tracer Study Completed' : 'CHED Graduate Tracer Study'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-md">
                      {hasSubmitted
                        ? `Submitted on ${surveyStatus?.submitted_at ? new Date(surveyStatus.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}. Thank you for contributing to BU's institutional research!`
                        : "Complete the official tracer study to help us understand graduate outcomes and continuously improve our programs."}
                    </p>
                  </div>
                </div>
                {!hasSubmitted && (
                  <Button asChild size="lg" className="shrink-0 bg-primary hover:bg-emerald text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02]">
                    <Link href="/survey">
                      Start Survey
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {hasSubmitted && surveyStatus?.status !== 'submitted' && (
                  <Badge variant="secondary" className="shrink-0">Draft saved</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Secondary Actions ─── */}
        <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
          <Link href="/forum">
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="relative overflow-hidden rounded-2xl border border-mist/40 dark:border-sidebar-border/30 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer h-full group bg-card"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500/80 via-blue-400/50 to-blue-500/20" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-colors duration-500" />
              <div className="relative p-6 flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner ring-1 ring-black/5 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-card-foreground">Alumni Forum</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                    Connect with fellow graduates and join the conversation.
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/profile">
            <motion.div
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="relative overflow-hidden rounded-2xl border border-mist/40 dark:border-sidebar-border/30 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer h-full group bg-card"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500/80 via-purple-400/50 to-purple-500/20" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl group-hover:bg-purple-400/20 transition-colors duration-500" />
              <div className="relative p-6 flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner ring-1 ring-black/5 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Circle className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-lg text-card-foreground">My Profile</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                    Update your details and contact information.
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* ─── Recent Forum Activity ─── */}
        <motion.div variants={item}>
          <Card className="border-mist/50 dark:border-sidebar-border/30 shadow-sm overflow-hidden rounded-2xl bg-card">
            <div className="h-[3px] w-full bg-gradient-to-r from-primary/60 via-meadow/50 to-primary/20" />
            <CardHeader className="flex flex-row items-center justify-between pb-3 pt-6 px-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg font-bold font-display text-card-foreground">
                  Recent Forum Activity
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="hover:bg-mint/40 transition-colors text-primary font-medium">
                <Link href="/forum">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 px-6 pb-6">
              {recentThreads.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-mist/40 dark:border-sidebar-border/30 rounded-xl bg-muted/30">
                  <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground font-medium">No forum activity yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Be the first to start a discussion!</p>
                </div>
              ) : (
                recentThreads.map((thread, i) => (
                  <motion.div
                    key={thread.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                  >
                    <Link
                      href={`/forum/${thread.category?.slug || 'general'}/${thread.id}`}
                      className="flex items-start gap-3 rounded-xl border border-mist/30 dark:border-sidebar-border/30 bg-card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden relative"
                    >
                      <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-primary/20 group-hover:bg-primary transition-colors duration-300" />
                      <div className="flex-1 min-w-0 pl-3">
                        <p className="text-sm font-semibold text-card-foreground truncate group-hover:text-primary transition-colors duration-200">
                          {thread.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          by{' '}
                          <span className="font-medium text-muted-foreground">{thread.author?.full_name || 'Unknown'}</span>
                          {' · '}
                          <span className="text-primary/70">{thread.category?.name || 'General'}</span>
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-xs bg-background border-mist/40 dark:border-sidebar-border/30 group-hover:border-primary/30 transition-colors">
                        {thread.reply_count} replies
                      </Badge>
                    </Link>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
