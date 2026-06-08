'use client';

import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { Profile } from '@/lib/types';

export default function UsersPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [filtered, setFiltered] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(data || []);
      setFiltered(data || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      users.filter(
        (u) =>
          (u.display_name || u.full_name || '').toLowerCase().includes(term) ||
          (u.email || '').toLowerCase().includes(term) ||
          (u.degree || '').toLowerCase().includes(term) ||
          (u.college || '').toLowerCase().includes(term)
      )
    );
  }, [search, users]);

  const updateRole = async (id: string, role: string) => {
    const { error } = await supabase.from('profiles').update({ role: role as any }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: role as any } : u)));
      toast({ title: 'Role updated' });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-forest dark:text-sidebar-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">Manage alumni accounts and roles.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, degree, or college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users ({filtered.length})</CardTitle>
            <CardDescription>View and manage user roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filtered.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9 shrink-0">
                      {u.avatar_url ? (
                        <AvatarImage src={u.avatar_url} alt={u.display_name || u.full_name || 'User'} />
                      ) : null}
                      <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                        {(u.display_name || u.full_name || '?')[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {u.display_name || u.full_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{u.email || u.id}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px]">
                          {u.college || 'No college'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {u.degree || 'No degree'}
                        </Badge>
                        {u.batch_year && (
                          <Badge variant="outline" className="text-[10px]">
                            Class of {u.batch_year}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant={
                        u.role === 'admin'
                          ? 'destructive'
                          : u.role === 'moderator'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {u.role}
                    </Badge>
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className="text-sm border rounded-md px-2 py-1 bg-background"
                    >
                      <option value="alumni">Alumni</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-muted-foreground text-sm text-center py-8">No users found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
