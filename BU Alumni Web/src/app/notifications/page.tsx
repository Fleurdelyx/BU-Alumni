'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, CheckCheck, Bell } from 'lucide-react';
import type { Notification } from '@/lib/types';

export default function NotificationsPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('notifications')
        .select('*, actor:profiles(full_name, avatar_url)')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false });
      setNotifications(data || []);
      setLoading(false);

      channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload: any) => {
            if (payload.eventType === 'INSERT') {
              setNotifications((prev) => [
                payload.new as Notification,
                ...prev,
              ]);
            } else if (payload.eventType === 'UPDATE') {
              setNotifications((prev) =>
                prev.map((n) =>
                  n.id === payload.new.id ? (payload.new as Notification) : n
                )
              );
            }
          }
        )
        .subscribe();
    }

    load();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    }
  };

  const markAllRead = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast({ title: 'All notifications marked as read' });
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

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
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display text-forest dark:text-sidebar-foreground">
              Notifications
            </h1>
            <p className="text-muted-foreground mt-1">
              Stay updated on your alumni network activity.
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="h-10 w-10 mb-3 opacity-20" />
                <p>No notifications yet.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((n) => (
              <Card key={n.id} className={n.is_read ? 'opacity-70' : ''}>
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {n.message || 'New notification'}
                      </p>
                      {!n.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {n.actor?.full_name ? `by ${n.actor.full_name}` : 'System'} ·{' '}
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!n.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                      onClick={() => markAsRead(n.id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
