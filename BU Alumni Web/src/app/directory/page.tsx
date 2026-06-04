'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { AppLayout } from '@/components/app-layout';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import type { Profile } from '@/lib/types';

const PAGE_SIZE = 12;

export default function DirectoryPage() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [batchFilter, setBatchFilter] = useState<string>('all');
  const [degreeFilter, setDegreeFilter] = useState<string>('all');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [batchOptions, setBatchOptions] = useState<number[]>([]);
  const [degreeOptions, setDegreeOptions] = useState<string[]>([]);
  const [collegeOptions, setCollegeOptions] = useState<string[]>([]);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('profiles').select('*', { count: 'exact' });

    if (searchTerm) {
      query = query.or(
        `full_name.ilike.%${searchTerm}%,degree.ilike.%${searchTerm}%,college.ilike.%${searchTerm}%`
      );
    }
    if (batchFilter && batchFilter !== 'all') {
      query = query.eq('batch_year', parseInt(batchFilter));
    }
    if (degreeFilter && degreeFilter !== 'all') {
      query = query.eq('degree', degreeFilter);
    }
    if (collegeFilter && collegeFilter !== 'all') {
      query = query.eq('college', collegeFilter);
    }

    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error(error);
    } else {
      setProfiles(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [supabase, searchTerm, batchFilter, degreeFilter, collegeFilter, page]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    async function loadFilters() {
      const { data } = await supabase
        .from('profiles')
        .select('batch_year, degree, college');
      if (data) {
        const batches = Array.from(
          new Set(data.map((d: any) => d.batch_year).filter(Boolean))
        ).sort((a, b) => (b as number) - (a as number)) as number[];
        const degrees = Array.from(
          new Set(data.map((d: any) => d.degree).filter(Boolean))
        ).sort() as string[];
        const colleges = Array.from(
          new Set(data.map((d: any) => d.college).filter(Boolean))
        ).sort() as string[];
        setBatchOptions(batches);
        setDegreeOptions(degrees);
        setCollegeOptions(colleges);
      }
    }
    loadFilters();
  }, [supabase]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-forest">
            Alumni Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse and connect with fellow alumni.
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name, degree, or college..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select
              value={batchFilter}
              onValueChange={(v) => {
                setBatchFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                {batchOptions.map((b) => (
                  <SelectItem key={b} value={String(b)}>
                    Batch {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={degreeFilter}
              onValueChange={(v) => {
                setDegreeFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Degree" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Degrees</SelectItem>
                {degreeOptions.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={collegeFilter}
              onValueChange={(v) => {
                setCollegeFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="College" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {collegeOptions.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : profiles.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {profiles.map((profile) => (
                <Card
                  key={profile.id}
                  className="overflow-hidden transition-all hover:shadow-md"
                >
                  <CardHeader className="items-center text-center pb-2">
                    <Avatar className="h-20 w-20 border-2 border-primary/10">
                      <AvatarImage
                        src={profile.avatar_url || ''}
                        alt={profile.full_name}
                      />
                      <AvatarFallback className="text-lg bg-primary/5 text-primary">
                        {profile.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="mt-2 line-clamp-1">
                      {profile.full_name}
                    </CardTitle>
                    <CardDescription>
                      Class of {profile.batch_year || 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-center pt-0 space-y-2">
                    <p className="font-semibold text-primary/80 line-clamp-1">
                      {profile.degree || 'No degree listed'}
                    </p>
                    <p className="text-muted-foreground line-clamp-1">
                      {profile.college || 'No college listed'}
                    </p>
                    {profile.is_verified && (
                      <Badge
                        variant="outline"
                        className="text-success border-success"
                      >
                        Verified
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            {searchTerm ||
            batchFilter !== 'all' ||
            degreeFilter !== 'all' ||
            collegeFilter !== 'all'
              ? 'No alumni found matching your filters.'
              : 'No alumni profiles found.'}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
