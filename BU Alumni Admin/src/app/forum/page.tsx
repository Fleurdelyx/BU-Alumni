'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  Lock,
  LockOpen,
  Pin,
  PinOff,
  CheckCircle2,
  XCircle,
  Trash2,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  Eye,
  ShieldAlert,
  Filter,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export default function ForumModPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [threads, setThreads] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportTab, setReportTab] = useState<ReportStatus>('pending');
  const [reportFilter, setReportFilter] = useState<string>('all');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, [supabase]);

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportTab]);

  async function loadData() {
    setLoading(true);
    const [{ data: threadData }, { data: reportData }, { data: catData }] = await Promise.all([
      supabase
        .from('forum_threads')
        .select('*, author:profiles(display_name, full_name), category:forum_categories(*)')
        .order('created_at', { ascending: false }),
      supabase
        .from('forum_reports')
        .select('*, reporter:profiles(display_name, full_name)')
        .eq('status', reportTab)
        .order('created_at', { ascending: false }),
      supabase.from('forum_categories').select('*').order('sort_order'),
    ]);
    setThreads(threadData || []);
    setReports(reportData || []);
    setCategories(catData || []);
    setLoading(false);
  }

  const updateThread = async (id: string, updates: Record<string, any>, successMsg: string) => {
    const { error } = await supabase.from('forum_threads').update(updates).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
      toast({ title: successMsg });
    }
  };

  const toggleLock = (id: string, current: boolean) =>
    updateThread(id, { is_locked: !current }, `Thread ${current ? 'unlocked' : 'locked'}`);

  const togglePin = (id: string, current: boolean) =>
    updateThread(id, { is_pinned: !current }, `Thread ${current ? 'unpinned' : 'pinned'}`);

  const toggleSolved = (id: string, current: boolean) =>
    updateThread(id, { is_solved: !current }, `Thread marked ${current ? 'unsolved' : 'solved'}`);

  const moveCategory = async (id: string, categoryId: string) => {
    await updateThread(id, { category_id: categoryId }, 'Thread moved');
  };

  const softDeleteThread = async (id: string) => {
    await updateThread(id, { is_deleted: true }, 'Thread hidden');
  };

  const restoreThread = async (id: string) => {
    await updateThread(id, { is_deleted: false }, 'Thread restored');
  };

  const handleReport = async (reportId: string, status: ReportStatus) => {
    const { error } = await supabase
      .from('forum_reports')
      .update({ status, resolved_by: userId, resolved_at: new Date().toISOString() })
      .eq('id', reportId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast({ title: `Report ${status}` });
    }
  };

  const filteredReports = reportFilter === 'all' ? reports : reports.filter((r) => r.reason === reportFilter);
  const reportReasons = Array.from(new Set(reports.map((r) => r.reason)));

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
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-display text-forest dark:text-sidebar-foreground tracking-tight">Forum Moderation</h1>
          <p className="text-slate mt-2 text-sm max-w-lg">
            Review reported content, manage discussions, and maintain community standards.
          </p>
        </div>

        {/* Reports Queue */}
        <Card className="border-mist/60 shadow-sm overflow-hidden">
          <div className="h-[3px] w-full bg-gradient-to-r from-red-500/70 via-orange-400/50 to-red-500/20" />
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                <div>
                  <CardTitle className="text-card-foreground font-semibold">Reports Queue</CardTitle>
                  <CardDescription>Flagged threads and replies awaiting review.</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(['pending', 'resolved', 'dismissed'] as ReportStatus[]).map((tab) => (
                  <Button
                    key={tab}
                    variant={reportTab === tab ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReportTab(tab)}
                    className={reportTab === tab ? 'shadow-sm' : ''}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === 'pending' && reports.length > 0 && (
                      <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px]">
                        {reports.length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportTab === 'pending' && reportReasons.length > 1 && (
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-mist/30">
                <Filter className="h-3.5 w-3.5 text-slate" />
                <span className="text-xs font-medium text-muted-foreground">Filter:</span>
                <Select value={reportFilter} onValueChange={setReportFilter}>
                  <SelectTrigger className="w-[160px] h-8 text-xs border-mist/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All reasons</SelectItem>
                    {reportReasons.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {filteredReports.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-mist/40 rounded-lg">
                <CheckCircle2 className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-sm text-slate font-medium">No {reportTab} reports</p>
                <p className="text-xs text-muted-foreground mt-1">The moderation queue is clear.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReports.map((r) => (
                  <div
                    key={r.id}
                    className="relative rounded-xl border border-mist/50 bg-white p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
                  >
                    {/* Left accent based on status */}
                    <div
                      className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${
                        r.reason === 'spam' ? 'bg-orange-400' :
                        r.reason === 'harassment' ? 'bg-red-500' :
                        r.reason === 'misinformation' ? 'bg-amber-500' :
                        'bg-primary'
                      }`}
                    />
                    <div className="flex items-center justify-between pl-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="destructive"
                          className="text-xs font-semibold shadow-sm"
                        >
                          {r.reason}
                        </Badge>
                        <span className="text-[10px] font-bold text-slate uppercase tracking-wider bg-fog px-1.5 py-0.5 rounded">
                          {r.target_type}
                        </span>
                        {r.status !== 'pending' && r.resolved_at && (
                          <span className="text-xs text-slate">
                            {new Date(r.resolved_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {reportTab === 'pending' && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReport(r.id, 'resolved')}
                            className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Resolve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReport(r.id, 'dismissed')}
                            className="text-slate hover:text-foreground"
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Dismiss
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-card-foreground/80 mt-2 pl-3 leading-relaxed">
                      {r.details || 'No details provided'}
                    </p>
                    <p className="text-xs text-slate mt-2 pl-3">
                      Reported by{' '}
                      <span className="font-medium text-muted-foreground">
                        {r.reporter?.display_name || r.reporter?.full_name || 'Unknown'}
                      </span>{' '}
                      · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                    {r.target_type === 'thread' && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_ALUMNI_APP_URL || 'https://bu-alumni-web.vercel.app'}/forum`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs text-primary hover:text-primary/80 font-medium mt-2 pl-3 hover:underline"
                      >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        Open Alumni Portal
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Threads */}
        <Card className="border-mist/60 shadow-sm overflow-hidden">
          <div className="h-[3px] w-full bg-gradient-to-r from-primary/60 via-meadow/50 to-primary/20" />
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-card-foreground font-semibold">All Threads</CardTitle>
                <CardDescription>Moderate forum discussions.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {threads.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-mist/40 rounded-lg">
                <MessageSquare className="h-8 w-8 mx-auto text-slate mb-2" />
                <p className="text-sm text-slate font-medium">No threads found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {threads.map((t) => (
                  <div
                    key={t.id}
                    className={`relative flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border p-4 gap-3 overflow-hidden transition-all duration-200 ${
                      t.is_deleted
                        ? 'border-red-100 bg-red-50/30 opacity-70 hover:opacity-100'
                        : t.is_pinned
                        ? 'border-primary/20 bg-primary/5 hover:shadow-md hover:-translate-y-0.5'
                        : 'border-mist/40 bg-white hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Left accent */}
                    <div
                      className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${
                        t.is_deleted
                          ? 'bg-red-400'
                          : t.is_pinned
                          ? 'bg-primary'
                          : t.is_solved
                          ? 'bg-green-500'
                          : 'bg-mist/60'
                      }`}
                    />
                    <div className="min-w-0 flex-1 pl-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-card-foreground truncate">{t.title}</p>
                        {t.is_pinned && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                            <Pin className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                        {t.is_locked && (
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                        {t.is_solved && (
                          <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Solved
                          </Badge>
                        )}
                        {t.is_deleted && (
                          <Badge variant="destructive" className="text-xs">Deleted</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate mt-1">
                        by{' '}
                        <span className="font-medium text-muted-foreground">
                          {t.author?.display_name || t.author?.full_name || 'Unknown'}
                        </span>{' '}
                        in{' '}
                        <span className="font-medium text-primary/80">{t.category?.name || 'General'}</span>
                        {' · '}
                        {new Date(t.created_at).toLocaleDateString()}
                        {' · '}
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> {t.reply_count || 0}
                        </span>
                        {' · '}
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {t.view_count || 0}
                        </span>
                        {' · '}
                        <span className="inline-flex items-center gap-1">
                          <ArrowUp className="h-3 w-3 text-green-600" /> {t.upvotes || 0}
                        </span>
                        {' · '}
                        <span className="inline-flex items-center gap-1">
                          <ArrowDown className="h-3 w-3 text-red-500" /> {t.downvotes || 0}
                        </span>
                        {' · '}
                        <span className="inline-flex items-center gap-1 font-medium">
                          Score: {(t.upvotes || 0) - (t.downvotes || 0)}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap pl-3 sm:pl-0">
                      <Select value={t.category_id} onValueChange={(v) => moveCategory(t.id, v)}>
                        <SelectTrigger className="h-8 w-[130px] text-xs border-mist/60">
                          <SelectValue placeholder="Move..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"
                        onClick={() => togglePin(t.id, t.is_pinned)}
                        title={t.is_pinned ? 'Unpin' : 'Pin'}
                      >
                        {t.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-amber-50 hover:text-amber-600"
                        onClick={() => toggleLock(t.id, t.is_locked)}
                        title={t.is_locked ? 'Unlock' : 'Lock'}
                      >
                        {t.is_locked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-green-50 hover:text-green-600"
                        onClick={() => toggleSolved(t.id, t.is_solved)}
                        title={t.is_solved ? 'Unsolve' : 'Solve'}
                      >
                        <CheckCircle2 className={`h-4 w-4 ${t.is_solved ? 'text-green-600' : ''}`} />
                      </Button>
                      {t.is_deleted ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg hover:bg-green-50 hover:text-green-600"
                          onClick={() => restoreThread(t.id)}
                          title="Restore"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => softDeleteThread(t.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
