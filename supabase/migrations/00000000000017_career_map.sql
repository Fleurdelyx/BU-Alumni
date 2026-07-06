-- BU Alumni Tracer Study — Career Map & Labor Market helpers
-- Anonymous, aggregated alumni location data for the public career map.

-- Returns anonymized pins for the alumni career map.
-- Aggregated by location/program/industry so no individual respondent is exposed.
CREATE OR REPLACE FUNCTION public.get_alumni_map_pins()
RETURNS TABLE (
  location TEXT,
  program TEXT,
  industry TEXT,
  alumni_count INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH primary_degree AS (
    SELECT DISTINCT ON (response_id)
      response_id,
      degree_name
    FROM public.gts_degrees
    ORDER BY response_id, sort_order ASC, id ASC
  )
  SELECT
    COALESCE(NULLIF(TRIM(a.province), ''), TRIM(a.region_of_origin), 'Unknown') AS location,
    COALESCE(TRIM(pd.degree_name), 'Unknown') AS program,
    COALESCE(NULLIF(TRIM(e.major_line_of_business), ''), 'Unknown') AS industry,
    COUNT(*)::INTEGER AS alumni_count
  FROM public.gts_responses r
  JOIN public.gts_section_a a ON a.response_id = r.id
  JOIN primary_degree pd ON pd.response_id = r.id
  LEFT JOIN public.gts_employment e ON e.response_id = r.id
  WHERE r.status = 'submitted'
    AND auth.uid() IS NOT NULL
  GROUP BY location, pd.degree_name, e.major_line_of_business;
$$;

GRANT EXECUTE ON FUNCTION public.get_alumni_map_pins() TO authenticated;
