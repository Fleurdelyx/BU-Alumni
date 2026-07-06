// Map web survey form values to/from the database schema.
// The database schema (supabase/migrations/00000000000000_base.sql) is the source of truth.

export const CIVIL_STATUS_MAP: Record<string, string> = {
  Single: 'single',
  Married: 'married',
  Separated: 'separated',
  'Single Parent': 'single_parent',
  Widowed: 'widowed',
};

export const CIVIL_STATUS_REVERSE: Record<string, string> = {
  single: 'Single',
  married: 'Married',
  separated: 'Separated',
  single_parent: 'Single Parent',
  widowed: 'Widowed',
};

export const SEX_MAP: Record<string, string> = {
  Male: 'male',
  Female: 'female',
};

export const SEX_REVERSE: Record<string, string> = {
  male: 'Male',
  female: 'Female',
};

export const LOCATION_TYPE_MAP: Record<string, string> = {
  City: 'city',
  Municipality: 'municipality',
};

export const LOCATION_TYPE_REVERSE: Record<string, string> = {
  city: 'City',
  municipality: 'Municipality',
};

export const EMPLOYMENT_STATUS_MAP: Record<string, string> = {
  Yes: 'employed',
  No: 'not_employed',
  'Never Been Employed': 'never_employed',
};

export const EMPLOYMENT_STATUS_REVERSE: Record<string, string> = {
  employed: 'Yes',
  not_employed: 'No',
  never_employed: 'Never Been Employed',
};

export const EMP_TYPE_MAP: Record<string, string> = {
  'Regular/Permanent': 'regular',
  Temporary: 'temporary',
  Contractual: 'contractual',
  Casual: 'casual',
  'Self-employed': 'self_employed',
};

export const EMP_TYPE_REVERSE: Record<string, string> = {
  regular: 'Regular/Permanent',
  temporary: 'Temporary',
  contractual: 'Contractual',
  casual: 'Casual',
  self_employed: 'Self-employed',
};

export const PLACE_OF_WORK_MAP: Record<string, string> = {
  Local: 'local',
  Abroad: 'abroad',
};

export const PLACE_OF_WORK_REVERSE: Record<string, string> = {
  local: 'Local',
  abroad: 'Abroad',
};

export const JOB_LEVEL_MAP: Record<string, string> = {
  'Rank/Clerical': 'rank_clerical',
  'Professional/Technical': 'professional_technical',
  Managerial: 'managerial',
  'Self-employed': 'self_employed',
};

export const JOB_LEVEL_REVERSE: Record<string, string> = {
  rank_clerical: 'Rank/Clerical',
  professional_technical: 'Professional/Technical',
  managerial: 'Managerial',
  self_employed: 'Self-employed',
};

export function toDbBoolean(value: string | boolean | null | undefined): boolean | null {
  if (value === true || value === 'Yes') return true;
  if (value === false || value === 'No') return false;
  return null;
}

export function fromDbBoolean(value: boolean | null | undefined): string {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return '';
}

export function toDateString(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date.toISOString().split('T')[0];
}

export function parseYear(value: string | number | null | undefined): number | null {
  if (!value) return null;
  const num = typeof value === 'number' ? value : parseInt(value, 10);
  return isNaN(num) ? null : num;
}
