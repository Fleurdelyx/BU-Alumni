'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@/lib/supabase/client';
import {
  CIVIL_STATUS_REVERSE,
  SEX_REVERSE,
  LOCATION_TYPE_REVERSE,
  EMPLOYMENT_STATUS_REVERSE,
  EMP_TYPE_REVERSE,
  PLACE_OF_WORK_REVERSE,
  JOB_LEVEL_REVERSE,
  fromDbBoolean,
} from '@/lib/survey-mappings';
import { ArrowLeft, FileText, User, GraduationCap, Briefcase, MessageSquareQuote, Circle } from 'lucide-react';

export default function SurveyReviewPage() {
  const supabase = createClient();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: response } = await supabase
        .from('gts_responses')
        .select(
          `
          *,
          section_a:gts_section_a(*),
          degrees:gts_degrees(*),
          exams:gts_prof_exams(*),
          reasons:gts_course_reasons(*),
          trainings:gts_trainings(*),
          employment:gts_employment(*),
          skills:gts_skills_feedback(*)
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setData(response);
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto space-y-6 pt-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto text-center pt-20">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h1 className="text-2xl font-bold font-display">No response yet</h1>
          <p className="text-muted-foreground mt-2 mb-6">You haven&apos;t started the tracer study yet.</p>
          <Button asChild>
            <Link href="/survey">Start Tracer Study</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isDraft = data.status !== 'submitted';
  const first = (arr: any) => (Array.isArray(arr) ? arr[0] : arr);
  const a = first(data.section_a) || {};
  const employment = first(data.employment) || {};
  const skills = first(data.skills) || {};

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 pt-2 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display">My Tracer Study</h1>
            <p className="text-sm text-muted-foreground">
              {isDraft ? (
                <span className="inline-flex items-center gap-1.5 text-amber-600">
                  <Circle className="h-3 w-3 fill-current" />
                  Draft — submit the tracer study to finalize your response
                </span>
              ) : (
                <>
                  Submitted on{' '}
                  {data.submitted_at
                    ? new Date(data.submitted_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isDraft && (
              <Button size="sm" asChild>
                <Link href="/survey">Continue Survey</Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to dashboard
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">General Information</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <Field label="Name" value={`${a.first_name || ''} ${a.middle_name || ''} ${a.last_name || ''}`} />
            <Field label="Birthday" value={a.birthday ? new Date(a.birthday).toLocaleDateString() : '—'} />
            <Field label="Sex" value={SEX_REVERSE[a.sex] || a.sex || '—'} />
            <Field label="Civil Status" value={CIVIL_STATUS_REVERSE[a.civil_status] || a.civil_status || '—'} />
            <Field label="Permanent Address" value={a.permanent_address} />
            <Field label="Location Type" value={LOCATION_TYPE_REVERSE[a.location_type] || a.location_type || '—'} />
            <Field label="Province" value={a.province} />
            <Field label="Region" value={a.region_of_origin} />
            <Field label="Mobile Number" value={a.mobile_number} />
            <Field label="Telephone" value={a.telephone || '—'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Educational Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {(data.degrees || []).length === 0 ? (
              <p className="text-muted-foreground">No degrees recorded.</p>
            ) : (
              (data.degrees || []).map((d: any, idx: number) => (
                <div key={idx} className="border-b border-border/60 last:border-0 pb-3 last:pb-0">
                  <p className="font-medium">{d.degree_name}</p>
                  <p className="text-muted-foreground">{d.college_university}</p>
                  <p className="text-muted-foreground">Year graduated: {d.year_graduated || '—'}</p>
                  {d.honors && <p className="text-muted-foreground">Honors: {d.honors}</p>}
                </div>
              ))
            )}
            {(data.reasons || []).length > 0 && (
              <div>
                <p className="font-medium mb-1">Reasons for taking the course</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  {(data.reasons || []).map((r: any, i: number) => (
                    <li key={i}>{r.reason_code}</li>
                  ))}
                </ul>
              </div>
            )}
            {(data.trainings || []).length > 0 && (
              <div>
                <p className="font-medium mb-1">Trainings / Advanced Studies</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  {(data.trainings || []).map((t: any, i: number) => (
                    <li key={i}>{t.title} — {t.duration} — {t.institution}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Employment Data</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <Field
              label="Employment Status"
              value={EMPLOYMENT_STATUS_REVERSE[employment.employment_status] || employment.employment_status || '—'}
            />
            <Field
              label="Employment Type"
              value={EMP_TYPE_REVERSE[employment.present_emp_type] || employment.present_emp_type || '—'}
            />
            <Field label="Present Occupation" value={employment.present_occupation} />
            <Field label="Major Line of Business" value={employment.major_line_of_business} />
            <Field label="Place of Work" value={PLACE_OF_WORK_REVERSE[employment.place_of_work] || employment.place_of_work || '—'} />
            <Field label="Initial Gross Monthly Earning" value={employment.initial_monthly_earning} />
            <Field label="First Job After College" value={fromDbBoolean(employment.is_first_job) || '—'} />
            <Field label="Curriculum Relevant" value={fromDbBoolean(employment.is_curriculum_relevant) || '—'} />
            <Field label="Job Level (First)" value={JOB_LEVEL_REVERSE[employment.job_level_first] || employment.job_level_first || '—'} />
            <Field label="Job Level (Current)" value={JOB_LEVEL_REVERSE[employment.job_level_current] || employment.job_level_current || '—'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <MessageSquareQuote className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Skills & Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {(skills.useful_competencies || []).length > 0 && (
              <div>
                <p className="font-medium mb-1">Useful Competencies</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  {skills.useful_competencies.map((c: string, i: number) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            {skills.suggestions_to_improve && (
              <div>
                <p className="font-medium mb-1">Suggestions to Improve Curriculum</p>
                <p className="text-muted-foreground whitespace-pre-line">{skills.suggestions_to_improve}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="font-medium">{value || '—'}</p>
    </div>
  );
}
