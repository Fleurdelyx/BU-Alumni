'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getCoordinates } from '@/lib/ph-locations';

export type MapPinData = {
  location: string;
  program: string;
  industry: string;
  alumni_count: number;
  lat: number;
  lng: number;
  matchedName: string;
};

export async function getAlumniMapPins(): Promise<{ pins: MapPinData[]; error?: string }> {
  try {
    // Ensure the caller is authenticated before returning aggregate data.
    const authClient = await createClient();
    const { data: { session } } = await authClient.auth.getSession();
    if (!session) {
      return { pins: [], error: 'You must be signed in to view the career map.' };
    }

    // Try the aggregated RPC using the authenticated client. The function is
    // SECURITY DEFINER and filters with auth.uid() IS NOT NULL, so it needs a
    // signed-in session to return rows.
    const { data: rpcData, error: rpcError } = await authClient.rpc('get_alumni_map_pins');
    if (rpcError) {
      // eslint-disable-next-line no-console
      console.error('career-map RPC error:', rpcError.message);
    }
    if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
      const pins = (rpcData as any[])
        .map((row) => {
          const coords = getCoordinates(row.location);
          if (!coords) return null;
          return {
            location: row.location,
            program: row.program,
            industry: row.industry,
            alumni_count: Number(row.alumni_count ?? row.count ?? 0),
            lat: coords.lat,
            lng: coords.lng,
            matchedName: coords.name,
          };
        })
        .filter(Boolean) as MapPinData[];
      // eslint-disable-next-line no-console
      console.log('career-map RPC pins:', pins.length);
      return { pins };
    }

    // Fallback: aggregate directly from submitted responses using the service role.
    // This lets the map render even if the RPC hasn't been applied or returns nothing.
    const supabase = createServiceClient();
    const { data: rows, error: queryError } = await supabase
      .from('gts_responses')
      .select(
        `
        id,
        sectionA:gts_section_a(province, region_of_origin),
        degrees:gts_degrees(degree_name),
        employment:gts_employment(major_line_of_business)
      `
      )
      .eq('status', 'submitted');

    if (queryError) {
      // eslint-disable-next-line no-console
      console.error('career-map fallback query error:', queryError.message);
      return { pins: [], error: queryError.message };
    }

    const agg = new Map<string, Omit<MapPinData, 'lat' | 'lng' | 'matchedName'>>();
    (rows || []).forEach((row: any) => {
      const location = row.sectionA?.province || row.sectionA?.region_of_origin || 'Unknown';
      const program = row.degrees?.[0]?.degree_name || 'Unknown';
      const industry = row.employment?.major_line_of_business || 'Unknown';
      const key = `${location}|${program}|${industry}`;
      const existing = agg.get(key) || { location, program, industry, alumni_count: 0 };
      existing.alumni_count += 1;
      agg.set(key, existing);
    });

    const pins = Array.from(agg.values())
      .map((pin) => {
        const coords = getCoordinates(pin.location);
        if (!coords) return null;
        return {
          ...pin,
          lat: coords.lat,
          lng: coords.lng,
          matchedName: coords.name,
        };
      })
      .filter(Boolean) as MapPinData[];

    // eslint-disable-next-line no-console
    console.log('career-map fallback rows:', rows?.length ?? 0, 'mapped pins:', pins.length);

    return { pins };
  } catch (err: any) {
    return { pins: [], error: err?.message || 'Failed to load map data.' };
  }
}
