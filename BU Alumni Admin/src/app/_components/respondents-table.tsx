'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function RespondentsTable() {
  const supabase = createClient();
  const { toast } = useToast();
  const [respondents, setRespondents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('gts_responses')
        .select(
          '*, profile:profiles(display_name, full_name, avatar_url, degree, batch_year), questionnaire:questionnaires(title)'
        )
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false });
      setRespondents(data || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleExport = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: 'Not authenticated', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch('/api/export-csv', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Export failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BU_Alumni_Tracer_Data_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'CSV exported successfully' });
    } catch (e: any) {
      toast({
        title: 'Export failed',
        description: e?.message || String(e),
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <FileDown className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Degree</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Questionnaire</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {respondents.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    {r.profile?.avatar_url ? (
                      <AvatarImage
                        src={r.profile.avatar_url}
                        alt={r.profile.display_name || r.profile.full_name}
                      />
                    ) : null}
                    <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                      {(r.profile?.display_name || r.profile?.full_name)?.[0] || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-medium">
                    {r.profile?.display_name || r.profile?.full_name || 'Unknown'}
                  </div>
                </div>
              </TableCell>
              <TableCell>{r.profile?.degree || 'N/A'}</TableCell>
              <TableCell>{r.profile?.batch_year || 'N/A'}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {r.questionnaire?.title || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell>
                {r.submitted_at
                  ? new Date(r.submitted_at).toLocaleDateString()
                  : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
          {respondents.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                No respondents found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
