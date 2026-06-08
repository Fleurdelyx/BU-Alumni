'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Profile } from '@/lib/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/respondents', label: 'Respondents', icon: FileText },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/forum', label: 'Forum Mod', icon: MessageSquare },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
          if (data) setProfile(data);
        });
      }
    });
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed h-full z-10 bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border/50 shadow-[4px_0_24px_rgba(0,0,0,0.04)]">
        {/* Logo area */}
        <div className="p-6 border-b border-sidebar-border/40">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-mint to-sage/40 dark:from-sidebar-accent/60 dark:to-sidebar-primary/30 flex items-center justify-center p-0.5 shadow-sm ring-1 ring-sidebar-border/60">
              <img src="/logos/bu.png" alt="BU" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight text-forest dark:text-sidebar-foreground">Admin</h1>
              <p className="text-[10px] text-primary/80 uppercase tracking-widest font-semibold">Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
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
                <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-sidebar-foreground/60'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-sidebar-border/40 space-y-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent/30 ring-1 ring-sidebar-border/40">
            <Avatar className="h-9 w-9 ring-2 ring-sidebar-border/40">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.display_name || profile.full_name || 'Admin'} />
              ) : null}
              <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-primary/20 to-meadow/30 text-primary">
                {profile?.display_name?.[0] || profile?.full_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">
                {profile?.display_name || profile?.full_name || 'Admin'}
              </p>
              <p className="text-[11px] text-primary/80 font-medium uppercase tracking-wide truncate">
                {profile?.role || 'Administrator'}
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
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="text-sidebar-foreground hover:bg-sidebar-accent/60 h-11 w-11">
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-mint to-sage/40 dark:from-sidebar-accent/60 dark:to-sidebar-primary/30 flex items-center justify-center p-0.5 shadow-sm ring-1 ring-sidebar-border/60">
              <img src="/logos/bu.png" alt="BU" className="h-full w-full object-contain" />
            </div>
            <span className="font-display font-bold text-forest dark:text-sidebar-foreground">Admin Portal</span>
          </Link>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-sidebar-foreground hover:text-red-400 hover:bg-red-950/30 h-11 px-3">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="w-64 bg-sidebar/98 backdrop-blur-xl h-full flex flex-col shadow-xl">
            <div className="p-4 border-b border-sidebar-border/40 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-mint to-sage/40 dark:from-sidebar-accent/60 dark:to-sidebar-primary/30 flex items-center justify-center p-0.5 shadow-sm ring-1 ring-sidebar-border/60">
                  <img src="/logos/bu.png" alt="BU" className="h-full w-full object-contain" />
                </div>
                <span className="font-display font-bold text-lg text-forest dark:text-sidebar-foreground">Admin</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="text-sidebar-foreground hover:bg-sidebar-accent/60 h-11 w-11">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
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
                    <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-sidebar-foreground/60'}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-sidebar-border/40 space-y-3">
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-sidebar-accent/30 ring-1 ring-sidebar-border/40">
                <Avatar className="h-9 w-9 ring-2 ring-sidebar-border/40">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.display_name || profile.full_name || 'Admin'} />
                  ) : null}
                  <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-primary/20 to-meadow/30 text-primary">
                    {profile?.display_name?.[0] || profile?.full_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {profile?.display_name || profile?.full_name || 'Admin'}
                  </p>
                  <p className="text-[11px] text-primary/80 font-medium uppercase tracking-wide truncate">
                    {profile?.role || 'Administrator'}
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
          </div>
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="lg:p-10 p-5 pt-24 lg:pt-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
