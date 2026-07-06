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

/* ─── Staggered container ─── */
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function DashboardPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentThreads, setRecentThreads] = useState<ForumThread[]>([]);
  const [surveyStatus, setSurveyStatus] = useState<GtsResponse | null>(null);
  const [lastPostDate, setLastPostDate] = useState<string | null>(null);
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
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentThreads(threads || []);

      const { data: response } = await supabase
        .from('gts_responses')
        .select('*, questionnaire:questionnaires(title)')
        .eq('user_id', user.id)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      setSurveyStatus(response);

      // Fetch user's last forum post date (thread or reply)
      const [{ data: myThreads }, { data: myReplies }] = await Promise.all([
        supabase.from('forum_threads').select('created_at').eq('author_id', user.id).eq('is_deleted', false).order('created_at', { ascending: false }).limit(1),
        supabase.from('forum_replies').select('created_at').eq('author_id', user.id).eq('is_deleted', false).order('created_at', { ascending: false }).limit(1),
      ]);
      const threadDate = myThreads?.[0]?.created_at;
      const replyDate = myReplies?.[0]?.created_at;
      if (threadDate || replyDate) {
        const latest = new Date(Math.max(
          threadDate ? new Date(threadDate).getTime() : 0,
          replyDate ? new Date(replyDate).getTime() : 0
        ));
        setLastPostDate(latest.toISOString());
      }

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
        className="space-y-6 max-w-5xl mx-auto pt-2"
      >
        {/* ─── Minimal Welcome Header ─── */}
        <motion.div variants={item} className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <img src="/logos/bu.png" alt="BU" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-foreground">
              Welcome back, <span className="text-primary">{profile?.full_name?.split(' ')[0] || 'Alumni'}</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              {hasSubmitted
                ? 'Thanks for completing your tracer study!'
                : 'Complete your tracer study to help shape BU\'s future.'}
            </p>
          </div>
        </motion.div>

        {/* ─── Quick Stats Row ─── */}
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: FileText, label: 'Survey', value: hasSubmitted ? 'Completed' : 'Pending', color: hasSubmitted ? 'text-green-600' : 'text-amber-600', bg: hasSubmitted ? 'bg-green-50' : 'bg-amber-50' },
            { icon: MessageSquare, label: 'Forum Posts', value: lastPostDate ? new Date(lastPostDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No posts yet', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Users, label: 'Network', value: 'Growing', color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: Calendar, label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—', color: 'text-primary', bg: 'bg-primary/10' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl bg-card border border-border/60 p-3 shadow-sm"
            >
              <div className={`h-7 w-7 rounded-md ${stat.bg} ${stat.color} flex items-center justify-center mb-2`}>
                <stat.icon className="h-3.5 w-3.5" />
              </div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</p>
              <p className="text-sm font-semibold text-card-foreground mt-0.5">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* ─── Survey CTA ─── */}
        <motion.div variants={item}>
          <Card className={`rounded-xl border-border/60 shadow-sm ${hasSubmitted ? 'bg-green-50/40 dark:bg-green-950/20 border-green-200/60' : ''}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${hasSubmitted ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                    {hasSubmitted ? <CheckCircle2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </div>
                  <div>
                    <h2 className="font-semibold text-base text-card-foreground">
                      {hasSubmitted ? 'Tracer Study Completed' : 'CHED Graduate Tracer Study'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {hasSubmitted
                        ? `Submitted on ${surveyStatus?.submitted_at ? new Date(surveyStatus.submitted_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}.`
                        : "Help us understand graduate outcomes and improve our programs."}
                    </p>
                  </div>
                </div>
                {!hasSubmitted && (
                  <Button asChild size="sm" className="shrink-0 bg-primary hover:bg-emerald text-white">
                    <Link href="/survey">
                      Start Survey
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Quick Actions ─── */}
        <motion.div variants={item} className="grid gap-3 sm:grid-cols-2">
          <Link href="/forum">
            <div className="group rounded-xl border border-border/60 bg-card p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm text-card-foreground">Alumni Forum</h3>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <p className="text-xs text-muted-foreground truncate">Connect with fellow graduates</p>
              </div>
            </div>
          </Link>

          <Link href="/profile">
            <div className="group rounded-xl border border-border/60 bg-card p-4 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <Circle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm text-card-foreground">My Profile</h3>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                </div>
                <p className="text-xs text-muted-foreground truncate">Update your details</p>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* ─── Recent Forum Activity ─── */}
        <motion.div variants={item}>
          <Card className="border-border/60 shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Recent Forum Activity</CardTitle>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-primary">
                <Link href="/forum">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {recentThreads.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border/40 rounded-lg bg-muted/20">
                  <MessageSquare className="h-6 w-6 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">No forum activity yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentThreads.map((thread) => (
                    <Link
                      key={thread.id}
                      href={`/forum/${thread.category?.slug || 'general'}/${thread.id}`}
                      className="flex items-center gap-3 rounded-lg border border-border/40 p-3 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {thread.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          by {thread.author?.full_name || 'Unknown'} · {thread.category?.name || 'General'}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-[10px] bg-background">
                        {thread.reply_count} replies
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
