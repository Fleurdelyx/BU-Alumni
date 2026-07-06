'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getAlumniMapPins, type MapPinData } from './actions';
import { MapPin, Briefcase, GraduationCap, Users, Map as MapIcon, AlertTriangle } from 'lucide-react';

const CareerMap = dynamic(() => import('./_components/career-map').then((mod) => mod.CareerMap), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full rounded-none" />,
});

export default function CareerMapPage() {
  const [pins, setPins] = useState<MapPinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const { pins, error } = await getAlumniMapPins();
      if (!cancelled) {
        if (error) setError(error);
        else setPins(pins);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const uniqueLocations = new Set(pins.map((p) => p.location)).size;
    const totalAlumni = pins.reduce((sum, p) => sum + p.alumni_count, 0);
    const topIndustry =
      Object.entries(
        pins.reduce((acc, p) => {
          acc[p.industry] = (acc[p.industry] || 0) + p.alumni_count;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    return { uniqueLocations, totalAlumni, topIndustry };
  }, [pins]);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 pt-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <MapIcon className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Career Graph</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-foreground">Alumni Career Map</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            See where BU graduates are located across the Philippines, what programs they finished,
            and which industries they work in. Data comes from submitted tracer studies and is shown
            anonymously.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Locations', value: stats.uniqueLocations, icon: MapPin },
            { label: 'Alumni on map', value: stats.totalAlumni, icon: Users },
            { label: 'Top industry', value: stats.topIndustry, icon: Briefcase },
            { label: 'Programs', value: new Set(pins.map((p) => p.program)).size, icon: GraduationCap },
          ].map((s) => (
            <Card key={s.label} className="border-border/60 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <s.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{s.label}</p>
                  <p className="text-sm font-semibold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map */}
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-border/60">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Alumni locations in the Philippines
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <Skeleton className="h-[500px] w-full rounded-none" />
            ) : error ? (
              <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground px-6 text-center">
                <AlertTriangle className="h-10 w-10 mb-3 text-amber-500 opacity-80" />
                <p className="text-sm font-medium">Could not load map data</p>
                <p className="text-xs mt-1 max-w-md">{error}</p>
              </div>
            ) : pins.length === 0 ? (
              <div className="h-[500px] flex flex-col items-center justify-center text-muted-foreground">
                <MapPin className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No alumni locations yet</p>
                <p className="text-xs mt-1">Locations will appear once tracer studies are submitted.</p>
              </div>
            ) : (
              <div className="h-[500px] w-full">
                <CareerMap pins={pins} />
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Pins are grouped by location, program, and industry to protect individual privacy.
          Complete your tracer study to add your own contribution.
        </p>
      </div>
    </AppLayout>
  );
}
