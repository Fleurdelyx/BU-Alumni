import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'moderator'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all submitted responses with related data
    const { data: responses } = await supabase
      .from('gts_responses')
      .select(`
        id, status, submitted_at, created_at,
        profiles:user_id (full_name, email, batch_year, degree, college),
        gts_section_a (*),
        gts_employment (*),
        gts_skills_feedback (*)
      `)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false });

    const { data: degrees } = await supabase.from('gts_degrees').select('*');
    const { data: exams } = await supabase.from('gts_prof_exams').select('*');
    const { data: trainings } = await supabase.from('gts_trainings').select('*');

    const headers = [
      'Response ID', 'Full Name', 'Email', 'Batch Year', 'Degree', 'College',
      'Submitted At', 'Permanent Address', 'Civil Status', 'Sex', 'Birthday',
      'Region', 'Province', 'Location Type', 'Telephone', 'Mobile',
      'Degrees', 'Professional Exams', 'Trainings',
      'Employment Status', 'Not Employed Reasons', 'Present Emp Type',
      'Present Occupation', 'Line of Business', 'Place of Work',
      'Is First Job', 'Reasons Staying', 'Reasons Accepting', 'Reasons Changing',
      'Duration First Job', 'How Found First Job', 'Time to Land First Job',
      'Job Level First', 'Job Level Current', 'Initial Monthly Earning',
      'Curriculum Relevant', 'Useful Competencies', 'Suggestions', 'Peer Referrals'
    ];

    const escapeCsv = (val: any) => {
      if (val == null) return '';
      const str = String(val).replace(/"/g, '""');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str}"`;
      return str;
    };

    const rows = (responses || []).map((r: any) => {
      const profile = r.profiles || {};
      const secA = r.gts_section_a || {};
      const emp = r.gts_employment || {};
      const skills = r.gts_skills_feedback || {};
      const degs = (degrees || []).filter((d: any) => d.response_id === r.id);
      const exs = (exams || []).filter((e: any) => e.response_id === r.id);
      const trs = (trainings || []).filter((t: any) => t.response_id === r.id);

      return [
        r.id, profile.full_name, profile.email, profile.batch_year, profile.degree, profile.college,
        r.submitted_at, secA.permanent_address, secA.civil_status, secA.sex, secA.birthday,
        secA.region_of_origin, secA.province, secA.location_type, secA.telephone, secA.mobile_number,
        JSON.stringify(degs), JSON.stringify(exs), JSON.stringify(trs),
        emp.employment_status, (emp.not_employed_reasons || []).join('; '), emp.present_emp_type,
        emp.present_occupation, emp.major_line_of_business, emp.place_of_work,
        emp.is_first_job, (emp.reasons_for_staying || []).join('; '), (emp.reasons_for_accepting || []).join('; '),
        (emp.reasons_for_changing || []).join('; '), emp.duration_in_first_job, emp.how_found_first_job,
        emp.time_to_land_first_job, emp.job_level_first, emp.job_level_current, emp.initial_monthly_earning,
        emp.is_curriculum_relevant, (skills.useful_competencies || []).join('; '),
        skills.curriculum_suggestions, JSON.stringify(skills.peer_referrals || [])
      ].map(escapeCsv).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="bu-gts-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (err: any) {
    console.error('export-csv error:', err);
    return NextResponse.json({ error: err.message || 'Export failed' }, { status: 500 });
  }
}
