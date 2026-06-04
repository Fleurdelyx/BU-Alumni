'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  UserCircle,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Check,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { useProfile } from '@/components/profile-context';
import { useState, useEffect } from 'react';
import type { Notification } from '@/lib/types';
import { BuddyChatbot } from './buddy-chatbot';
import { formatDistanceToNow } from 'date-fns';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/survey', label: 'Tracer Study', icon: FileText },
  { href: '/forum', label: 'Forum', icon: MessageSquare },
  { href: '/directory', label: 'Directory', icon: Users },
  { href: '/profile', label: 'Profile', icon: UserCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { profile } = useProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      if (user) {
        loadNotifications(user.id);

        // Realtime notifications
        const channel = supabase
          .channel('layout-notifications')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `recipient_id=eq.${user.id}`,
            },
            () => {
              loadNotifications(user.id);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function loadNotifications(userId: string) {
    try {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);
      setUnreadCount(count || 0);

      const { data } = await supabase
        .from('notifications')
        .select('*, actor:profiles(full_name, avatar_url)')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setUnreadCount(0);
      setRecentNotifications([]);
    }
  }

  const markAsRead = async (id: string, userId: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    loadNotifications(userId);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleNotifOpenChange = (open: boolean) => {
    setNotifOpen(open);
    if (open && profile?.id) {
      setNotifLoading(true);
      loadNotifications(profile.id)
        .then(() => setNotifLoading(false))
        .catch(() => setNotifLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed h-full z-10 bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border/50 shadow-[4px_0_24px_rgba(0,0,0,0.04)]">
        <div className="p-6 border-b border-sidebar-border/40">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-mint to-sage/40 dark:from-sidebar-accent/60 dark:to-sidebar-primary/30 flex items-center justify-center p-0.5 shadow-sm ring-1 ring-sidebar-border/60">
              <img src="/logos/bu.png" alt="BU" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight text-forest dark:text-sidebar-foreground">Alumni</h1>
              <p className="text-[10px] text-primary/80 uppercase tracking-widest font-semibold">Tracer Study</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-primary/15'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground hover:shadow-sm'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-sidebar-foreground/60'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border/40 space-y-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent/30 ring-1 ring-sidebar-border/40">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-meadow/30 dark:from-primary/30 dark:to-sidebar-primary/40 flex items-center justify-center text-primary text-xs font-bold shadow-sm ring-1 ring-primary/20">
              {profile?.full_name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-[11px] text-primary/80 font-medium uppercase tracking-wide truncate">
                {profile?.role || 'Alumni'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-sm border-sidebar-border/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/50 dark:hover:text-red-400 dark:hover:border-red-900 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-sidebar-border/50 bg-sidebar/95 backdrop-blur-xl z-20 flex items-center justify-between px-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="text-sidebar-foreground hover:bg-sidebar-accent/60">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-mint to-sage/40 dark:from-sidebar-accent/60 dark:to-sidebar-primary/30 flex items-center justify-center p-0.5 shadow-sm ring-1 ring-sidebar-border/60">
            <img src="/logos/bu.png" alt="BU" className="h-full w-full object-contain" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle className="text-sidebar-foreground hover:bg-sidebar-accent/60" />
          {/* Mobile notification popover */}
          <Popover open={notifOpen} onOpenChange={handleNotifOpenChange}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-sidebar-foreground hover:bg-sidebar-accent/60">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 bg-white/95 backdrop-blur-xl border-mist/40 shadow-xl z-[60] mt-2" sideOffset={8}>
              <NotificationDropdown
                notifications={recentNotifications}
                loading={notifLoading}
                unreadCount={unreadCount}
                onMarkAsRead={(id) => profile?.id && markAsRead(id, profile.id)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="w-64 bg-sidebar/98 backdrop-blur-xl h-full flex flex-col shadow-xl">
            <div className="p-4 border-b border-sidebar-border/40 flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-mint to-sage/40 dark:from-sidebar-accent/60 dark:to-sidebar-primary/30 flex items-center justify-center p-0.5 shadow-sm ring-1 ring-sidebar-border/60">
                  <img src="/logos/bu.png" alt="BU" className="h-full w-full object-contain" />
                </div>
                <span className="font-display font-bold text-lg text-forest dark:text-sidebar-foreground">Alumni</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="text-sidebar-foreground hover:bg-sidebar-accent/60">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-primary/15'
                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-sidebar-foreground/60'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-sidebar-border/40 space-y-3">
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent/30 ring-1 ring-sidebar-border/40">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-meadow/30 dark:from-primary/30 dark:to-sidebar-primary/40 flex items-center justify-center text-primary text-xs font-bold shadow-sm ring-1 ring-primary/20">
                  {profile?.full_name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-[11px] text-primary/80 font-medium uppercase tracking-wide truncate">
                    {profile?.role || 'Alumni'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-sidebar-border/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/50 dark:hover:text-red-400 dark:hover:border-red-900 transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="hidden lg:flex h-16 items-center justify-between border-b border-sidebar-border/50 bg-sidebar/80 backdrop-blur-xl px-8 sticky top-0 z-10 shadow-[0_2px_16px_rgba(0,0,0,0.02)]">
          <div />
          <div className="flex items-center gap-4">
            {/* Desktop notification popover */}
            <Popover open={notifOpen} onOpenChange={handleNotifOpenChange}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-sidebar-foreground hover:bg-sidebar-accent/40 transition-colors">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-96 p-0 bg-white/95 backdrop-blur-xl border-mist/40 shadow-xl z-[60] mt-2" sideOffset={8}>
                <NotificationDropdown
                  notifications={recentNotifications}
                  loading={notifLoading}
                  unreadCount={unreadCount}
                  onMarkAsRead={(id) => profile?.id && markAsRead(id, profile.id)}
                />
              </PopoverContent>
            </Popover>

            <ThemeToggle className="text-sidebar-foreground hover:bg-sidebar-accent/40" />
            <div className="h-8 w-px bg-sidebar-border/60" />
            <Link href="/profile" className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-sidebar-accent/30 transition-colors cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-meadow/30 dark:from-primary/30 dark:to-sidebar-primary/40 flex items-center justify-center text-primary font-bold text-sm shadow-sm ring-1 ring-primary/20">
                {profile?.full_name?.[0] || '?'}
              </div>
              <span className="text-sm font-semibold text-sidebar-foreground">{profile?.full_name || 'User'}</span>
            </Link>
          </div>
        </div>
        <div className="pt-16 lg:pt-0 p-5 lg:p-10 max-w-7xl mx-auto">
          {children}
        </div>
        <BuddyChatbot />
      </main>
    </div>
  );
}

/* ─── Notification Dropdown Component ─── */
function NotificationDropdown({
  notifications,
  loading,
  unreadCount,
  onMarkAsRead,
}: {
  notifications: Notification[];
  loading: boolean;
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
}) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-mist/30">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-bold text-sm text-forest">Notifications</h3>
          {unreadCount > 0 && (
            <span className="h-5 px-1.5 rounded-full bg-error/10 text-error text-[10px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Bell className="h-8 w-8 text-primary/40" />
          </div>
          <p className="text-sm text-forest font-semibold">No notifications yet</p>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-[200px]">When you get replies, mentions, or updates, you&apos;ll see them here.</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[360px]">
          <div className="py-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`relative flex items-start gap-3 px-5 py-3.5 hover:bg-mint/30 transition-colors cursor-pointer group ${
                  !n.is_read ? 'bg-primary/[0.03]' : ''
                }`}
              >
                {/* Unread dot */}
                {!n.is_read && (
                  <span className="absolute left-2 top-5 h-2 w-2 rounded-full bg-primary shrink-0" />
                )}
                <div className="flex-1 min-w-0 pl-2.5">
                  <p className={`text-sm leading-relaxed ${n.is_read ? 'text-slate' : 'text-forest font-medium'}`}>
                    {n.message || 'New notification'}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-[11px] text-muted-foreground">
                      {n.actor?.full_name ? `by ${n.actor.full_name}` : 'System'}
                      {' · '}
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {!n.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(n.id);
                    }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-primary/10 text-primary mt-0.5"
                    title="Mark as read"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Footer */}
      <div className="border-t border-mist/30 px-5 py-3.5">
        <Link
          href="/notifications"
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-primary hover:text-emerald transition-colors"
        >
          View all notifications
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
