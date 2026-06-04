'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { AppLayout } from '@/components/app-layout';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Send,
  User,
  BookOpen,
  GraduationCap,
  Briefcase,
  MessageSquareQuote,
} from 'lucide-react';

// ==================== CONSTANTS ====================

const REGIONS = [
  'NCR',
  'CAR',
  'ARMM',
  'CARAGA',
  'Region I',
  'Region II',
  'Region III',
  'Region IV',
  'Region V',
  'Region VI',
  'Region VII',
  'Region VIII',
  'Region IX',
  'Region X',
  'Region XI',
  'Region XII',
  'Region XIII',
];

const PROVINCES: { name: string; region: string }[] = [
  // NCR
  { name: 'Caloocan', region: 'NCR' },
  { name: 'Las Piñas', region: 'NCR' },
  { name: 'Makati', region: 'NCR' },
  { name: 'Malabon', region: 'NCR' },
  { name: 'Mandaluyong', region: 'NCR' },
  { name: 'Manila', region: 'NCR' },
  { name: 'Marikina', region: 'NCR' },
  { name: 'Muntinlupa', region: 'NCR' },
  { name: 'Navotas', region: 'NCR' },
  { name: 'Parañaque', region: 'NCR' },
  { name: 'Pasay', region: 'NCR' },
  { name: 'Pasig', region: 'NCR' },
  { name: 'Pateros', region: 'NCR' },
  { name: 'Quezon City', region: 'NCR' },
  { name: 'San Juan', region: 'NCR' },
  { name: 'Taguig', region: 'NCR' },
  { name: 'Valenzuela', region: 'NCR' },
  // CAR
  { name: 'Abra', region: 'CAR' },
  { name: 'Apayao', region: 'CAR' },
  { name: 'Benguet', region: 'CAR' },
  { name: 'Ifugao', region: 'CAR' },
  { name: 'Kalinga', region: 'CAR' },
  { name: 'Mountain Province', region: 'CAR' },
  // Region I
  { name: 'Ilocos Norte', region: 'Region I' },
  { name: 'Ilocos Sur', region: 'Region I' },
  { name: 'La Union', region: 'Region I' },
  { name: 'Pangasinan', region: 'Region I' },
  // Region II
  { name: 'Batanes', region: 'Region II' },
  { name: 'Cagayan', region: 'Region II' },
  { name: 'Isabela', region: 'Region II' },
  { name: 'Nueva Vizcaya', region: 'Region II' },
  { name: 'Quirino', region: 'Region II' },
  // Region III
  { name: 'Aurora', region: 'Region III' },
  { name: 'Bataan', region: 'Region III' },
  { name: 'Bulacan', region: 'Region III' },
  { name: 'Nueva Ecija', region: 'Region III' },
  { name: 'Pampanga', region: 'Region III' },
  { name: 'Tarlac', region: 'Region III' },
  { name: 'Zambales', region: 'Region III' },
  // Region IV (Calabarzon + Mimaropa combined in the dropdown)
  { name: 'Batangas', region: 'Region IV' },
  { name: 'Cavite', region: 'Region IV' },
  { name: 'Laguna', region: 'Region IV' },
  { name: 'Quezon', region: 'Region IV' },
  { name: 'Rizal', region: 'Region IV' },
  { name: 'Marinduque', region: 'Region IV' },
  { name: 'Occidental Mindoro', region: 'Region IV' },
  { name: 'Oriental Mindoro', region: 'Region IV' },
  { name: 'Palawan', region: 'Region IV' },
  { name: 'Romblon', region: 'Region IV' },
  // Region V
  { name: 'Albay', region: 'Region V' },
  { name: 'Camarines Norte', region: 'Region V' },
  { name: 'Camarines Sur', region: 'Region V' },
  { name: 'Catanduanes', region: 'Region V' },
  { name: 'Masbate', region: 'Region V' },
  { name: 'Sorsogon', region: 'Region V' },
  // Region VI
  { name: 'Aklan', region: 'Region VI' },
  { name: 'Antique', region: 'Region VI' },
  { name: 'Capiz', region: 'Region VI' },
  { name: 'Guimaras', region: 'Region VI' },
  { name: 'Iloilo', region: 'Region VI' },
  { name: 'Negros Occidental', region: 'Region VI' },
  // Region VII
  { name: 'Bohol', region: 'Region VII' },
  { name: 'Cebu', region: 'Region VII' },
  { name: 'Negros Oriental', region: 'Region VII' },
  { name: 'Siquijor', region: 'Region VII' },
  // Region VIII
  { name: 'Biliran', region: 'Region VIII' },
  { name: 'Eastern Samar', region: 'Region VIII' },
  { name: 'Leyte', region: 'Region VIII' },
  { name: 'Northern Samar', region: 'Region VIII' },
  { name: 'Samar', region: 'Region VIII' },
  { name: 'Southern Leyte', region: 'Region VIII' },
  // Region IX
  { name: 'Zamboanga del Norte', region: 'Region IX' },
  { name: 'Zamboanga del Sur', region: 'Region IX' },
  { name: 'Zamboanga Sibugay', region: 'Region IX' },
  // Region X
  { name: 'Bukidnon', region: 'Region X' },
  { name: 'Camiguin', region: 'Region X' },
  { name: 'Lanao del Norte', region: 'Region X' },
  { name: 'Misamis Occidental', region: 'Region X' },
  { name: 'Misamis Oriental', region: 'Region X' },
  // Region XI
  { name: 'Compostela Valley', region: 'Region XI' },
  { name: 'Davao del Norte', region: 'Region XI' },
  { name: 'Davao del Sur', region: 'Region XI' },
  { name: 'Davao Occidental', region: 'Region XI' },
  { name: 'Davao Oriental', region: 'Region XI' },
  // Region XII
  { name: 'Cotabato', region: 'Region XII' },
  { name: 'Sarangani', region: 'Region XII' },
  { name: 'South Cotabato', region: 'Region XII' },
  { name: 'Sultan Kudarat', region: 'Region XII' },
  // Region XIII / CARAGA
  { name: 'Agusan del Norte', region: 'CARAGA' },
  { name: 'Agusan del Sur', region: 'CARAGA' },
  { name: 'Dinagat Islands', region: 'CARAGA' },
  { name: 'Surigao del Norte', region: 'CARAGA' },
  { name: 'Surigao del Sur', region: 'CARAGA' },
  // ARMM / Bangsamoro
  { name: 'Basilan', region: 'ARMM' },
  { name: 'Lanao del Sur', region: 'ARMM' },
  { name: 'Maguindanao', region: 'ARMM' },
  { name: 'Sulu', region: 'ARMM' },
  { name: 'Tawi-Tawi', region: 'ARMM' },
];

const PROVINCE_NAMES = PROVINCES.map((p) => p.name).sort((a, b) => a.localeCompare(b));

function getRegionForProvince(provinceName: string): string | undefined {
  return PROVINCES.find((p) => p.name === provinceName)?.region;
}

const COURSE_REASONS = [
  'High grades in the course',
  'Good grades in high school',
  'Influence of parents/relatives',
  'Influence of peers/friends',
  'Inspired by a role model',
  'Passion for the profession',
  'Immediate employment',
  'Prestige of the profession',
  'Available in the institution',
  'Career advancement',
  'Affordable tuition',
  'Attractive compensation',
  'Opportunity to work abroad',
  'No particular choice',
  'Others',
];

const LINES_OF_BUSINESS = [
  'Agriculture, Forestry, and Fishery',
  'Mining and Quarrying',
  'Manufacturing',
  'Electricity, Gas, and Water Supply',
  'Construction',
  'Wholesale and Retail Trade',
  'Transportation and Storage',
  'Accommodation and Food Service Activities',
  'Information and Communication',
  'Financial and Insurance Activities',
  'Real Estate Activities',
  'Professional, Scientific and Technical Activities',
  'Administrative and Support Service Activities',
  'Public Administration and Defense',
  'Education',
  'Human Health and Social Work Activities',
  'Arts, Entertainment and Recreation',
  'Other Service Activities',
];

const REASONS_NOT_EMPLOYED = [
  'Advance study',
  'Family concern',
  'Health-related reasons',
  'No job opportunity',
  'Did not look for a job',
  'Lack of work experience',
  'Others',
];

const REASONS_STAYING = [
  'Salaries and benefits',
  'Career challenge',
  'Related to special skills',
  'Proximity to residence',
  'Peer influence',
  'Family influence',
  'Job security',
  'Others',
];

const REASONS_CHANGING = [
  'Salaries and benefits',
  'Career challenge',
  'Related to special skills',
  'Proximity to residence',
  'Peer influence',
  'Family influence',
  'Job security',
  'Others',
];

const HOW_FOUND_FIRST_JOB = [
  'Response to advertisement',
  'Arranged by school/job placement office',
  'Family business',
  'Walk-in application',
  'Job fair',
  'Recommended by someone',
  'Online job portal',
  'Others',
];

const HOW_LONG_FIRST_JOB = [
  'Less than 1 month',
  '1 to 6 months',
  '7 to 11 months',
  '1 year to less than 2 years',
  '2 years to less than 3 years',
  '3 years to less than 4 years',
];

const HOW_LONG_LAND = [
  'Less than 1 month',
  '1 to 6 months',
  '7 to 11 months',
  '1 year to less than 2 years',
  '2 years to less than 3 years',
  '3 years and above',
];

const EARNINGS_RANGES = [
  'Below ₱5,000',
  '₱5,000 – ₱10,000',
  '₱10,000 – ₱15,000',
  '₱15,000 – ₱20,000',
  '₱20,000 – ₱25,000',
  'Above ₱25,000',
];

const COMPETENCIES = [
  'Communication skills',
  'Human Relations skills',
  'Entrepreneurial skills',
  'Information Technology skills',
  'Problem-solving skills',
  'Critical Thinking skills',
  'Others',
];

const STEPS = [
  { label: 'General Information', icon: User },
  { label: 'Educational Background', icon: BookOpen },
  { label: 'Trainings & Advanced Studies', icon: GraduationCap },
  { label: 'Employment Data', icon: Briefcase },
  { label: 'Skills & Feedback', icon: MessageSquareQuote },
];

// ==================== SCHEMAS ====================

const degreeSchema = z.object({
  degree_and_specialization: z.string().min(1, 'Degree is required'),
  college_university: z.string().min(1, 'College/University is required'),
  year_graduated: z.string().min(1, 'Year graduated is required'),
  honors_awards: z.string().optional(),
});

const profExamSchema = z.object({
  name_of_examination: z.string().min(1, 'Examination name is required'),
  date_taken: z.string().min(1, 'Date taken is required'),
  rating: z.string().min(1, 'Rating is required'),
});

const trainingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  duration_credits: z.string().min(1, 'Duration / Credits is required'),
  institution: z.string().min(1, 'Institution is required'),
});

const peerReferralSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  contact: z.string().min(1, 'Contact is required'),
});

const surveySchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, 'Last name is required'),
  permanent_address: z.string().min(1, 'Permanent address is required'),
  email: z.string().email('Valid email is required'),
  telephone: z.string().optional(),
  mobile_number: z.string().min(1, 'Mobile number is required'),
  civil_status: z.string().min(1, 'Civil status is required'),
  sex: z.string().min(1, 'Sex is required'),
  date_of_birth: z.date({ required_error: 'Date of birth is required', invalid_type_error: 'Invalid date' }).nullable(),
  region_of_origin: z.string().min(1, 'Region is required'),
  province: z.string().min(1, 'Province is required'),
  location_of_residence: z.string().min(1, 'Location is required'),

  degrees: z.array(degreeSchema).min(1, 'Add at least one degree'),
  prof_exams: z.array(profExamSchema).default([]),
  course_reasons: z.array(z.string()).min(1, 'Select at least one reason'),

  trainings: z.array(trainingSchema).default([]),
  advanced_studies_reason: z.string().optional(),

  presently_employed: z.string().optional(),
  reasons_not_employed: z.array(z.string()).default([]),
  employment_status: z.string().optional(),
  self_employed_skills: z.string().optional(),
  present_occupation: z.string().optional(),
  major_line_of_business: z.string().optional(),
  place_of_work: z.string().optional(),
  first_job_after_college: z.string().optional(),
  reasons_for_staying: z.array(z.string()).default([]),
  reasons_for_changing: z.array(z.string()).default([]),
  how_long_first_job: z.string().optional(),
  how_found_first_job: z.string().optional(),
  how_long_to_land_first_job: z.string().optional(),
  job_level_first: z.string().optional(),
  job_level_current: z.string().optional(),
  initial_gross_monthly_earning: z.string().optional(),
  curriculum_relevant: z.string().optional(),

  useful_competencies: z.array(z.string()).default([]),
  suggestions_to_improve: z.string().optional(),
  peer_referrals: z.array(peerReferralSchema).default([]),
});

type SurveyFormData = z.infer<typeof surveySchema>;

const SURVEY_DEFAULTS: SurveyFormData = {
  first_name: '',
  middle_name: '',
  last_name: '',
  permanent_address: '',
  email: '',
  telephone: '',
  mobile_number: '',
  civil_status: '',
  sex: '',
  date_of_birth: null,
  region_of_origin: '',
  province: '',
  location_of_residence: '',
  degrees: [],
  prof_exams: [],
  course_reasons: [],
  trainings: [],
  advanced_studies_reason: '',
  presently_employed: '',
  reasons_not_employed: [],
  employment_status: '',
  self_employed_skills: '',
  present_occupation: '',
  major_line_of_business: '',
  place_of_work: '',
  first_job_after_college: '',
  reasons_for_staying: [],
  reasons_for_changing: [],
  how_long_first_job: '',
  how_found_first_job: '',
  how_long_to_land_first_job: '',
  job_level_first: '',
  job_level_current: '',
  initial_gross_monthly_earning: '',
  curriculum_relevant: '',
  useful_competencies: [],
  suggestions_to_improve: '',
  peer_referrals: [],
};

// ==================== HELPERS ====================

function CheckboxGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[] | undefined;
  onChange: (val: string[]) => void;
}) {
  const safeValue = value || [];
  const toggle = (option: string) => {
    if (safeValue.includes(option)) {
      onChange(safeValue.filter((v) => v !== option));
    } else {
      onChange([...safeValue, option]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {options.map((option) => (
        <div key={option} className="flex items-start space-x-2">
          <Checkbox id={option} checked={safeValue.includes(option)} onCheckedChange={() => toggle(option)} />
          <Label htmlFor={option} className="text-sm font-normal leading-tight cursor-pointer">
            {option}
          </Label>
        </div>
      ))}
    </div>
  );
}

function RadioOptionGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value?: string;
  onChange: (val: string) => void;
}) {
  return (
    <RadioGroup value={value || ''} onValueChange={onChange} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {options.map((option) => (
        <div key={option} className="flex items-center space-x-2">
          <RadioGroupItem value={option} id={option} />
          <Label htmlFor={option} className="text-sm font-normal cursor-pointer">
            {option}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}

function StepHeader({ number, title, description }: { number: number; title: string; description?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
          {number}
        </div>
        <h2 className="text-xl font-semibold text-card-foreground">{title}</h2>
      </div>
      {description && <p className="text-sm text-muted-foreground ml-11">{description}</p>}
    </div>
  );
}

// ==================== STEP 1: GENERAL INFORMATION ====================

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <FormLabel>
      {children}
      <span className="text-destructive ml-0.5">*</span>
    </FormLabel>
  );
}

function Step1GeneralInfo() {
  const { control, setValue, watch } = useFormContext<SurveyFormData>();
  const selectedProvince = watch('province');

  // Auto-select region when province changes
  React.useEffect(() => {
    if (selectedProvince) {
      const region = getRegionForProvince(selectedProvince);
      if (region) {
        setValue('region_of_origin', region, { shouldValidate: true });
      }
    }
  }, [selectedProvince, setValue]);

  return (
    <div className="space-y-6">
      <StepHeader number={1} title="General Information" description="Personal and contact details" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <FormField
          control={control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <RequiredLabel>First Name</RequiredLabel>
              <FormControl>
                <Input placeholder="Juan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="middle_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Middle Name</FormLabel>
              <FormControl>
                <Input placeholder="Reyes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <RequiredLabel>Last Name</RequiredLabel>
              <FormControl>
                <Input placeholder="Dela Cruz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <RequiredLabel>Email</RequiredLabel>
            <FormControl>
              <Input type="email" readOnly {...field} className="bg-muted" />
            </FormControl>
            <FormDescription>Pre-filled from your profile</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="permanent_address"
        render={({ field }) => (
          <FormItem>
            <RequiredLabel>Permanent Address</RequiredLabel>
            <FormControl>
              <Textarea placeholder="Complete address" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField
          control={control}
          name="telephone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telephone / Contact Number(s)</FormLabel>
              <FormControl>
                <Input placeholder="(044) 123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="mobile_number"
          render={({ field }) => (
            <FormItem>
              <RequiredLabel>Mobile Number</RequiredLabel>
              <FormControl>
                <Input placeholder="0917 123 4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField
          control={control}
          name="civil_status"
          render={({ field }) => (
            <FormItem>
              <RequiredLabel>Civil Status</RequiredLabel>
              <FormControl>
                <RadioOptionGroup
                  options={['Single', 'Married', 'Separated', 'Single Parent', 'Widowed']}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="sex"
          render={({ field }) => (
            <FormItem>
              <RequiredLabel>Sex</RequiredLabel>
              <FormControl>
                <RadioOptionGroup options={['Male', 'Female']} value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField
          control={control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <RequiredLabel>Date of Birth</RequiredLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    disabled={(date: Date) => date > new Date() || date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="region_of_origin"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <RequiredLabel>Region of Origin</RequiredLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField
          control={control}
          name="province"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <RequiredLabel>Province</RequiredLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  {PROVINCE_NAMES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="location_of_residence"
          render={({ field }) => (
            <FormItem>
              <RequiredLabel>Location of Residence</RequiredLabel>
              <FormControl>
                <RadioOptionGroup options={['City', 'Municipality']} value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// ==================== STEP 2: EDUCATIONAL BACKGROUND ====================

function Step2EducationalBackground() {
  const { control, watch } = useFormContext<SurveyFormData>();
  const {
    fields: degreeFields,
    append: appendDegree,
    remove: removeDegree,
  } = useFieldArray({ control, name: 'degrees' });
  const {
    fields: examFields,
    append: appendExam,
    remove: removeExam,
  } = useFieldArray({ control, name: 'prof_exams' });

  return (
    <div className="space-y-8">
      <StepHeader number={2} title="Educational Background" description="Academic credentials and examinations" />

      {/* Degrees */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wide">Degree(s) & Specialization</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendDegree({ degree_and_specialization: '', college_university: '', year_graduated: '', honors_awards: '' })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Degree
          </Button>
        </div>

        {degreeFields.length === 0 && (
          <Alert variant="default" className="bg-muted border-dashed">
            <AlertDescription>No degrees added yet. Click "Add Degree" to begin.</AlertDescription>
          </Alert>
        )}

        {degreeFields.map((field, index) => (
          <Card key={field.id} className="border-mist">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Degree #{index + 1}</span>
                <Button type="button" variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => removeDegree(index)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`degrees.${index}.degree_and_specialization`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Degree & Specialization</FormLabel>
                      <FormControl>
                        <Input placeholder="BS in Information Technology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`degrees.${index}.college_university`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College / University</FormLabel>
                      <FormControl>
                        <Input placeholder="Baliuag University" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`degrees.${index}.year_graduated`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Graduated</FormLabel>
                      <FormControl>
                        <Input placeholder="2023" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`degrees.${index}.honors_awards`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Honors / Awards (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Cum Laude, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Professional Exams */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wide">Professional Examination(s)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendExam({ name_of_examination: '', date_taken: '', rating: '' })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Exam
          </Button>
        </div>

        {examFields.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No professional examinations added. Click "Add Exam" if applicable.</p>
        )}

        {examFields.map((field, index) => (
          <Card key={field.id} className="border-mist">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Exam #{index + 1}</span>
                <Button type="button" variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => removeExam(index)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name={`prof_exams.${index}.name_of_examination`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of Examination</FormLabel>
                      <FormControl>
                        <Input placeholder="Licensure Exam" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`prof_exams.${index}.date_taken`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Taken</FormLabel>
                      <FormControl>
                        <Input placeholder="Month Year" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`prof_exams.${index}.rating`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating</FormLabel>
                      <FormControl>
                        <Input placeholder="80.50%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Course Reasons */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wide">Reason(s) for Taking the Course</h3>
        <FormField
          control={control}
          name="course_reasons"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <CheckboxGroup options={COURSE_REASONS} value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// ==================== STEP 3: TRAININGS & ADVANCED STUDIES ====================

function Step3Trainings() {
  const { control } = useFormContext<SurveyFormData>();
  const {
    fields: trainingFields,
    append: appendTraining,
    remove: removeTraining,
  } = useFieldArray({ control, name: 'trainings' });

  return (
    <div className="space-y-8">
      <StepHeader number={3} title="Trainings & Advanced Studies" description="Professional development and continuing education" />

      {/* Trainings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wide">Training(s) / Seminar(s) Attended</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendTraining({ title: '', duration_credits: '', institution: '' })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Training
          </Button>
        </div>

        {trainingFields.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No trainings added. Click "Add Training" if applicable.</p>
        )}

        {trainingFields.map((field, index) => (
          <Card key={field.id} className="border-mist">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Training #{index + 1}</span>
                <Button type="button" variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => removeTraining(index)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name={`trainings.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Training title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`trainings.${index}.duration_credits`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration & Credits</FormLabel>
                      <FormControl>
                        <Input placeholder="3 days / 24 hrs" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`trainings.${index}.institution`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution</FormLabel>
                      <FormControl>
                        <Input placeholder="Conducting body" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Advanced Studies Reason */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wide">Reason for Pursuing Advanced Studies (if any)</h3>
        <FormField
          control={control}
          name="advanced_studies_reason"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioOptionGroup
                  options={['For promotion', 'Professional development', 'Others']}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// ==================== STEP 4: EMPLOYMENT DATA ====================

function Step4Employment() {
  const { control, watch } = useFormContext<SurveyFormData>();
  const presentlyEmployed = watch('presently_employed');
  const employmentStatus = watch('employment_status');
  const firstJobAfterCollege = watch('first_job_after_college');

  return (
    <div className="space-y-8">
      <StepHeader number={4} title="Employment Data" description="Current and first job information" />

      {/* Q16 */}
      <div className="space-y-4">
        <FormField
          control={control}
          name="presently_employed"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Are you presently employed?</FormLabel>
              <FormControl>
                <RadioOptionGroup
                  options={['Yes', 'No', 'Never Been Employed']}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* NOT EMPLOYED branch */}
      <div className={cn(presentlyEmployed !== 'Yes' && presentlyEmployed ? 'block' : 'hidden')}>
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4 space-y-4">
            <FormField
              control={control}
              name="reasons_not_employed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason(s) for not being employed</FormLabel>
                  <FormControl>
                    <CheckboxGroup options={REASONS_NOT_EMPLOYED} value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* EMPLOYED branch */}
      <div className={cn(presentlyEmployed === 'Yes' ? 'block' : 'hidden', 'space-y-6')}>
        <FormField
          control={control}
          name="employment_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employment Status</FormLabel>
              <FormControl>
                <RadioOptionGroup
                  options={['Regular/Permanent', 'Temporary', 'Contractual', 'Casual', 'Self-employed']}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className={cn(employmentStatus === 'Self-employed' ? 'block' : 'hidden')}>
          <FormField
            control={control}
            name="self_employed_skills"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What skills did you apply for self-employment?</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the skills applied..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="present_occupation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Present Occupation</FormLabel>
                <FormControl>
                  <Input placeholder="Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="major_line_of_business"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Major Line of Business</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LINES_OF_BUSINESS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="place_of_work"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Place of Work</FormLabel>
              <FormControl>
                <RadioOptionGroup options={['Local', 'Abroad']} value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="first_job_after_college"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Is this your first job after college?</FormLabel>
              <FormControl>
                <RadioOptionGroup options={['Yes', 'No']} value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className={cn(firstJobAfterCollege === 'Yes' ? 'block' : 'hidden')}>
          <FormField
            control={control}
            name="reasons_for_staying"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason(s) for staying on the job</FormLabel>
                <FormControl>
                  <CheckboxGroup options={REASONS_STAYING} value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className={cn(firstJobAfterCollege === 'No' ? 'block' : 'hidden')}>
          <FormField
            control={control}
            name="reasons_for_changing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason(s) for changing job</FormLabel>
                <FormControl>
                  <CheckboxGroup options={REASONS_CHANGING} value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="how_long_first_job"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How long was your first job?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {HOW_LONG_FIRST_JOB.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="how_found_first_job"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How did you find your first job?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {HOW_FOUND_FIRST_JOB.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="how_long_to_land_first_job"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How long did it take to land your first job?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {HOW_LONG_LAND.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="job_level_first"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Level — First Job</FormLabel>
                <FormControl>
                  <RadioOptionGroup
                    options={['Rank/Clerical', 'Professional/Technical', 'Managerial', 'Self-employed']}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="job_level_current"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Level — Current Job</FormLabel>
                <FormControl>
                  <RadioOptionGroup
                    options={['Rank/Clerical', 'Professional/Technical', 'Managerial', 'Self-employed']}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="initial_gross_monthly_earning"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Gross Monthly Earning (First Job)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EARNINGS_RANGES.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="curriculum_relevant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Was the curriculum relevant to your first job?</FormLabel>
              <FormControl>
                <RadioOptionGroup options={['Yes', 'No']} value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// ==================== STEP 5: SKILLS & FEEDBACK ====================

function Step5SkillsFeedback() {
  const { control, watch } = useFormContext<SurveyFormData>();
  const curriculumRelevant = watch('curriculum_relevant');
  const {
    fields: referralFields,
    append: appendReferral,
    remove: removeReferral,
  } = useFieldArray({ control, name: 'peer_referrals' });

  return (
    <div className="space-y-8">
      <StepHeader number={5} title="Skills & Feedback" description="Competencies and curriculum feedback" />

      <div className={cn(curriculumRelevant === 'Yes' ? 'block' : 'hidden')}>
        <FormField
          control={control}
          name="useful_competencies"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">Useful Competencies Learned in College</FormLabel>
              <FormControl>
                <CheckboxGroup options={COMPETENCIES} value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="suggestions_to_improve"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Suggestion(s) to Improve the Curriculum</FormLabel>
            <FormControl>
              <Textarea placeholder="Share your thoughts on how the curriculum can be improved..." rows={5} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      {/* Peer Referrals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-card-foreground uppercase tracking-wide">Peer Referrals</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendReferral({ name: '', address: '', contact: '' })}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Referral
          </Button>
        </div>

        {referralFields.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No referrals added. Click "Add Referral" if you wish to refer peers.</p>
        )}

        {referralFields.map((field, index) => (
          <Card key={field.id} className="border-mist">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Referral #{index + 1}</span>
                <Button type="button" variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => removeReferral(index)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name={`peer_referrals.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`peer_referrals.${index}.address`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Complete address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name={`peer_referrals.${index}.contact`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Mobile / Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ==================== REVIEW SCREEN ====================

function ReviewScreen({ onEdit }: { onEdit: (step: number) => void }) {
  const { getValues } = useFormContext<SurveyFormData>();
  const data = getValues();

  const renderValue = (val: unknown) => {
    if (val === undefined || val === null || val === '') return <span className="text-muted-foreground italic">Not provided</span>;
    if (Array.isArray(val)) {
      if (val.length === 0) return <span className="text-muted-foreground italic">None</span>;
      return (
        <ul className="list-disc list-inside text-sm">
          {val.map((item, i) => (
            <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
          ))}
        </ul>
      );
    }
    if (val instanceof Date) return format(val, 'PPP');
    return String(val);
  };

  return (
    <div className="space-y-8">
      <StepHeader number={6} title="Review Your Responses" description="Please verify your information before submitting" />

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Step 1 — General Information</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(0)}>
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div><span className="text-muted-foreground">Name:</span> {renderValue([data.first_name, data.middle_name, data.last_name].filter(Boolean).join(' '))}</div>
            <div><span className="text-muted-foreground">Email:</span> {renderValue(data.email)}</div>
            <div className="md:col-span-2"><span className="text-muted-foreground">Address:</span> {renderValue(data.permanent_address)}</div>
            <div><span className="text-muted-foreground">Telephone:</span> {renderValue(data.telephone)}</div>
            <div><span className="text-muted-foreground">Mobile:</span> {renderValue(data.mobile_number)}</div>
            <div><span className="text-muted-foreground">Civil Status:</span> {renderValue(data.civil_status)}</div>
            <div><span className="text-muted-foreground">Sex:</span> {renderValue(data.sex)}</div>
            <div><span className="text-muted-foreground">Date of Birth:</span> {renderValue(data.date_of_birth)}</div>
            <div><span className="text-muted-foreground">Region:</span> {renderValue(data.region_of_origin)}</div>
            <div><span className="text-muted-foreground">Province:</span> {renderValue(data.province)}</div>
            <div><span className="text-muted-foreground">Residence:</span> {renderValue(data.location_of_residence)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Step 2 — Educational Background</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(1)}>
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground font-medium">Degrees:</span>
            {(data.degrees || []).map((d, i) => (
              <div key={i} className="ml-4 mt-1 p-2 bg-muted rounded">
                <div>{d.degree_and_specialization} — {d.college_university} ({d.year_graduated})</div>
                {d.honors_awards && <div className="text-muted-foreground">Honors: {d.honors_awards}</div>}
              </div>
            ))}
          </div>
          {(data.prof_exams || []).length > 0 && (
            <div>
              <span className="text-muted-foreground font-medium">Professional Exams:</span>
              {(data.prof_exams || []).map((e, i) => (
                <div key={i} className="ml-4 mt-1">{e.name_of_examination} — {e.date_taken} — {e.rating}</div>
              ))}
            </div>
          )}
          <div>
            <span className="text-muted-foreground font-medium">Reasons for Taking Course:</span>
            <div className="ml-4">{renderValue(data.course_reasons)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Step 3 — Trainings & Advanced Studies</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(2)}>
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(data.trainings || []).length > 0 ? (
            (data.trainings || []).map((t, i) => (
              <div key={i} className="ml-4">{t.title} — {t.duration_credits} — {t.institution}</div>
            ))
          ) : (
            <span className="text-muted-foreground italic">No trainings recorded</span>
          )}
          {data.advanced_studies_reason && (
            <div><span className="text-muted-foreground">Reason for Advanced Studies:</span> {data.advanced_studies_reason}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Step 4 — Employment Data</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(3)}>
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">Presently Employed:</span> {renderValue(data.presently_employed)}</div>
          {data.presently_employed !== 'Yes' && data.presently_employed ? (
            <div><span className="text-muted-foreground">Reasons Not Employed:</span> {renderValue(data.reasons_not_employed)}</div>
          ) : data.presently_employed === 'Yes' ? (
            <>
              <div><span className="text-muted-foreground">Employment Status:</span> {renderValue(data.employment_status)}</div>
              {data.self_employed_skills && <div><span className="text-muted-foreground">Self-employed Skills:</span> {renderValue(data.self_employed_skills)}</div>}
              <div><span className="text-muted-foreground">Present Occupation:</span> {renderValue(data.present_occupation)}</div>
              <div><span className="text-muted-foreground">Line of Business:</span> {renderValue(data.major_line_of_business)}</div>
              <div><span className="text-muted-foreground">Place of Work:</span> {renderValue(data.place_of_work)}</div>
              <div><span className="text-muted-foreground">First Job After College:</span> {renderValue(data.first_job_after_college)}</div>
              {data.first_job_after_college === 'Yes' && (
                <div><span className="text-muted-foreground">Reasons for Staying:</span> {renderValue(data.reasons_for_staying)}</div>
              )}
              {data.first_job_after_college === 'No' && (
                <div><span className="text-muted-foreground">Reasons for Changing:</span> {renderValue(data.reasons_for_changing)}</div>
              )}
              <div><span className="text-muted-foreground">How Long in First Job:</span> {renderValue(data.how_long_first_job)}</div>
              <div><span className="text-muted-foreground">How Found First Job:</span> {renderValue(data.how_found_first_job)}</div>
              <div><span className="text-muted-foreground">How Long to Land First Job:</span> {renderValue(data.how_long_to_land_first_job)}</div>
              <div><span className="text-muted-foreground">Job Level (First):</span> {renderValue(data.job_level_first)}</div>
              <div><span className="text-muted-foreground">Job Level (Current):</span> {renderValue(data.job_level_current)}</div>
              <div><span className="text-muted-foreground">Initial Gross Monthly Earning:</span> {renderValue(data.initial_gross_monthly_earning)}</div>
              <div><span className="text-muted-foreground">Curriculum Relevant:</span> {renderValue(data.curriculum_relevant)}</div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Step 5 — Skills & Feedback</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => onEdit(4)}>
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {data.curriculum_relevant === 'Yes' && (
            <div><span className="text-muted-foreground">Useful Competencies:</span> {renderValue(data.useful_competencies)}</div>
          )}
          <div><span className="text-muted-foreground">Suggestions:</span> {renderValue(data.suggestions_to_improve)}</div>
          {(data.peer_referrals || []).length > 0 && (
            <div>
              <span className="text-muted-foreground">Peer Referrals:</span>
              {(data.peer_referrals || []).map((r, i) => (
                <div key={i} className="ml-4 mt-1">{r.name} — {r.address} — {r.contact}</div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== SUCCESS SCREEN ====================

function SuccessScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
      <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-card-foreground">Submission Successful!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Thank you for completing the CHED Graduate Tracer Study. Your responses have been recorded and will help improve
          our academic programs.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <a href="/dashboard">Go to Dashboard</a>
        </Button>
        <Button asChild>
          <a href="/profile">View Profile</a>
        </Button>
      </div>
    </div>
  );
}


// ==================== MAIN PAGE COMPONENT ====================

export default function SurveyPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responseId, setResponseId] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    mode: 'onSubmit',
    defaultValues: SURVEY_DEFAULTS,
  });

  const { trigger, setError, clearErrors, getValues, setValue, reset } = form;

  // Load user profile and existing draft
  useEffect(() => {
    let cancelled = false;
    async function init() {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) {
        setIsLoading(false);
        return;
      }
      if (cancelled) return;
      setUserId(user.id);

      // Load profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

      // Load existing draft
      const { data: existingResponse } = await supabase
        .from('gts_responses')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      const defaults: SurveyFormData = {
        ...SURVEY_DEFAULTS,
        first_name: profile?.first_name || '',
        middle_name: profile?.middle_name || '',
        last_name: profile?.last_name || '',
        email: user.email || '',
      };

      if (existingResponse) {
        setResponseId(existingResponse.id);

        // Load section A
        const { data: sectionA } = await supabase
          .from('gts_section_a')
          .select('*')
          .eq('response_id', existingResponse.id)
          .maybeSingle();

        if (sectionA) {
          Object.assign(defaults, {
            first_name: sectionA.first_name || defaults.first_name,
            middle_name: sectionA.middle_name || defaults.middle_name,
            last_name: sectionA.last_name || defaults.last_name,
            permanent_address: sectionA.permanent_address || '',
            email: sectionA.email || defaults.email,
            telephone: sectionA.telephone || '',
            mobile_number: sectionA.mobile_number || '',
            civil_status: sectionA.civil_status || '',
            sex: sectionA.sex || '',
            date_of_birth: sectionA.date_of_birth ? new Date(sectionA.date_of_birth) : null,
            region_of_origin: sectionA.region_of_origin || '',
            province: sectionA.province || '',
            location_of_residence: sectionA.location_of_residence || '',
          });
        }

        // Load degrees
        const { data: degrees } = await supabase.from('gts_degrees').select('*').eq('response_id', existingResponse.id);
        if (degrees && degrees.length > 0) {
          defaults.degrees = degrees.map((d) => ({
            degree_and_specialization: d.degree_and_specialization || '',
            college_university: d.college_university || '',
            year_graduated: d.year_graduated || '',
            honors_awards: d.honors_awards || '',
          }));
        }

        // Load prof exams
        const { data: exams } = await supabase.from('gts_prof_exams').select('*').eq('response_id', existingResponse.id);
        if (exams && exams.length > 0) {
          defaults.prof_exams = exams.map((e) => ({
            name_of_examination: e.name_of_examination || '',
            date_taken: e.date_taken || '',
            rating: e.rating || '',
          }));
        }

        // Load course reasons
        const { data: reasons } = await supabase.from('gts_course_reasons').select('*').eq('response_id', existingResponse.id);
        if (reasons && reasons.length > 0) {
          defaults.course_reasons = reasons.map((r) => r.reason).filter(Boolean);
        }

        // Load trainings
        const { data: trainings } = await supabase.from('gts_trainings').select('*').eq('response_id', existingResponse.id);
        if (trainings && trainings.length > 0) {
          defaults.trainings = trainings.map((t) => ({
            title: t.title || '',
            duration_credits: t.duration_credits || '',
            institution: t.institution || '',
          }));
        }

        // Load employment
        const { data: employment } = await supabase
          .from('gts_employment')
          .select('*')
          .eq('response_id', existingResponse.id)
          .maybeSingle();
        if (employment) {
          Object.assign(defaults, {
            presently_employed: employment.presently_employed || '',
            reasons_not_employed: employment.reasons_not_employed || [],
            employment_status: employment.employment_status || '',
            self_employed_skills: employment.self_employed_skills || '',
            present_occupation: employment.present_occupation || '',
            major_line_of_business: employment.major_line_of_business || '',
            place_of_work: employment.place_of_work || '',
            first_job_after_college: employment.first_job_after_college || '',
            reasons_for_staying: employment.reasons_for_staying || [],
            reasons_for_changing: employment.reasons_for_changing || [],
            how_long_first_job: employment.how_long_first_job || '',
            how_found_first_job: employment.how_found_first_job || '',
            how_long_to_land_first_job: employment.how_long_to_land_first_job || '',
            job_level_first: employment.job_level_first || '',
            job_level_current: employment.job_level_current || '',
            initial_gross_monthly_earning: employment.initial_gross_monthly_earning || '',
            curriculum_relevant: employment.curriculum_relevant || '',
          });
        }

        // Load skills & feedback
        const { data: skills } = await supabase
          .from('gts_skills_feedback')
          .select('*')
          .eq('response_id', existingResponse.id)
          .maybeSingle();
        if (skills) {
          Object.assign(defaults, {
            useful_competencies: skills.useful_competencies || [],
            suggestions_to_improve: skills.suggestions_to_improve || '',
            peer_referrals: skills.peer_referrals || [],
          });
        }
      }

      if (cancelled) return;
      reset(defaults);
      setIsLoading(false);
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [reset]);

  const validateCurrentStep = useCallback(
    async (step: number): Promise<boolean> => {
      clearErrors();

      if (step === 0) {
        const ok = await trigger([
          'first_name',
          'last_name',
          'permanent_address',
          'email',
          'mobile_number',
          'civil_status',
          'sex',
          'date_of_birth',
          'region_of_origin',
          'province',
          'location_of_residence',
        ]);
        return ok;
      }

      if (step === 1) {
        const ok = await trigger(['degrees', 'course_reasons']);
        return ok;
      }

      if (step === 2) {
        // Optional step
        return true;
      }

      if (step === 3) {
        const ok = await trigger(['presently_employed']);
        if (!ok) return false;

        const data = getValues();
        if (!data.presently_employed) {
          setError('presently_employed', { type: 'manual', message: 'Please select your employment status' });
          return false;
        }

        if (data.presently_employed === 'No' || data.presently_employed === 'Never Been Employed') {
          if ((data.reasons_not_employed || []).length === 0) {
            setError('reasons_not_employed', { type: 'manual', message: 'Select at least one reason' });
            return false;
          }
          return true;
        }

        // Employed = Yes
        const employedFields: (keyof SurveyFormData)[] = [
          'employment_status',
          'present_occupation',
          'major_line_of_business',
          'place_of_work',
          'first_job_after_college',
          'how_long_first_job',
          'how_found_first_job',
          'how_long_to_land_first_job',
          'job_level_first',
          'job_level_current',
          'initial_gross_monthly_earning',
          'curriculum_relevant',
        ];
        if (data.employment_status === 'Self-employed') {
          employedFields.push('self_employed_skills');
        }
        if (data.first_job_after_college === 'Yes') {
          employedFields.push('reasons_for_staying');
        } else if (data.first_job_after_college === 'No') {
          employedFields.push('reasons_for_changing');
        }

        const empOk = await trigger(employedFields);
        if (!empOk) return false;

        if (data.first_job_after_college === 'Yes' && (data.reasons_for_staying || []).length === 0) {
          setError('reasons_for_staying', { type: 'manual', message: 'Select at least one reason' });
          return false;
        }
        if (data.first_job_after_college === 'No' && (data.reasons_for_changing || []).length === 0) {
          setError('reasons_for_changing', { type: 'manual', message: 'Select at least one reason' });
          return false;
        }

        return true;
      }

      if (step === 4) {
        const data = getValues();
        if (data.curriculum_relevant === 'Yes' && data.useful_competencies.length === 0) {
          setError('useful_competencies', { type: 'manual', message: 'Select at least one competency' });
          return false;
        }
        return true;
      }

      return true;
    },
    [trigger, setError, clearErrors, getValues]
  );

  const saveDraft = useCallback(
    async (data: SurveyFormData, rid?: string): Promise<string | undefined> => {
      if (!userId) return;
      const supabase = createClient();

      // Upsert gts_responses
      const responsePayload: Record<string, unknown> = {
        user_id: userId,
        status: 'draft',
      };
      if (rid) {
        responsePayload.id = rid;
      }

      const { data: resp, error: respError } = await supabase
        .from('gts_responses')
        .upsert(responsePayload)
        .select()
        .single();

      if (respError) throw respError;
      const newRid = resp.id;

      // Upsert gts_section_a
      await supabase.from('gts_section_a').upsert(
        {
          response_id: newRid,
          first_name: data.first_name,
          middle_name: data.middle_name || null,
          last_name: data.last_name,
          permanent_address: data.permanent_address,
          email: data.email,
          telephone: data.telephone || null,
          mobile_number: data.mobile_number,
          civil_status: data.civil_status,
          sex: data.sex,
          date_of_birth: data.date_of_birth ? format(data.date_of_birth, 'yyyy-MM-dd') : null,
          region_of_origin: data.region_of_origin,
          province: data.province,
          location_of_residence: data.location_of_residence,
        },
        { onConflict: 'response_id' }
      );

      // Replace degrees
      await supabase.from('gts_degrees').delete().eq('response_id', newRid);
      if ((data.degrees || []).length > 0) {
        await supabase.from('gts_degrees').insert(
          (data.degrees || []).map((d) => ({
            response_id: newRid,
            degree_and_specialization: d.degree_and_specialization,
            college_university: d.college_university,
            year_graduated: d.year_graduated,
            honors_awards: d.honors_awards || null,
          }))
        );
      }

      // Replace prof exams
      await supabase.from('gts_prof_exams').delete().eq('response_id', newRid);
      if ((data.prof_exams || []).length > 0) {
        await supabase.from('gts_prof_exams').insert(
          (data.prof_exams || []).map((e) => ({
            response_id: newRid,
            name_of_examination: e.name_of_examination,
            date_taken: e.date_taken,
            rating: e.rating,
          }))
        );
      }

      // Replace course reasons
      await supabase.from('gts_course_reasons').delete().eq('response_id', newRid);
      if ((data.course_reasons || []).length > 0) {
        await supabase.from('gts_course_reasons').insert(
          (data.course_reasons || []).map((r) => ({
            response_id: newRid,
            reason: r,
          }))
        );
      }

      // Replace trainings
      await supabase.from('gts_trainings').delete().eq('response_id', newRid);
      if ((data.trainings || []).length > 0) {
        await supabase.from('gts_trainings').insert(
          (data.trainings || []).map((t) => ({
            response_id: newRid,
            title: t.title,
            duration_credits: t.duration_credits,
            institution: t.institution,
          }))
        );
      }

      // Upsert employment
      await supabase.from('gts_employment').upsert(
        {
          response_id: newRid,
          presently_employed: data.presently_employed || null,
          reasons_not_employed: data.reasons_not_employed,
          employment_status: data.employment_status || null,
          self_employed_skills: data.self_employed_skills || null,
          present_occupation: data.present_occupation || null,
          major_line_of_business: data.major_line_of_business || null,
          place_of_work: data.place_of_work || null,
          first_job_after_college: data.first_job_after_college || null,
          reasons_for_staying: data.reasons_for_staying,
          reasons_for_changing: data.reasons_for_changing,
          how_long_first_job: data.how_long_first_job || null,
          how_found_first_job: data.how_found_first_job || null,
          how_long_to_land_first_job: data.how_long_to_land_first_job || null,
          job_level_first: data.job_level_first || null,
          job_level_current: data.job_level_current || null,
          initial_gross_monthly_earning: data.initial_gross_monthly_earning || null,
          curriculum_relevant: data.curriculum_relevant || null,
        },
        { onConflict: 'response_id' }
      );

      // Upsert skills & feedback
      await supabase.from('gts_skills_feedback').upsert(
        {
          response_id: newRid,
          useful_competencies: data.useful_competencies,
          suggestions_to_improve: data.suggestions_to_improve || null,
          peer_referrals: data.peer_referrals,
        },
        { onConflict: 'response_id' }
      );

      return newRid;
    },
    [userId]
  );

  const handleNext = async () => {
    const data = getValues();
    const valid = await validateCurrentStep(currentStep);
    if (!valid) return;

    if (currentStep < STEPS.length - 1) {
      // Auto-save on step completion
      setIsSaving(true);
      try {
        const rid = await saveDraft(data, responseId);
        if (rid) setResponseId(rid);
        toast({ title: 'Draft saved', description: `Step ${currentStep + 1} progress saved.` });
      } catch (err) {
        console.error('Auto-save error:', err);
        toast({
          title: 'Save failed',
          description: 'Could not auto-save draft. You can continue and try again.',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
      setCurrentStep((s) => s + 1);
    } else {
      setCurrentStep(STEPS.length); // Go to review
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmitFinal = async () => {
    setIsSubmitting(true);
    try {
      const data = getValues();
      const rid = await saveDraft(data, responseId);
      if (!rid) throw new Error('No response ID');

      const supabase = createClient();
      const { error } = await supabase
        .from('gts_responses')
        .update({ status: 'submitted', submitted_at: new Date().toISOString() })
        .eq('id', rid);

      if (error) throw error;

      setSubmitted(true);
      toast({ title: 'Submitted successfully', description: 'Thank you for completing the tracer study.' });
    } catch (err) {
      console.error('Submit error:', err);
      toast({
        title: 'Submission failed',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFromReview = (step: number) => {
    setCurrentStep(step);
  };

  const progressPercent = submitted
    ? 100
    : currentStep < STEPS.length
    ? ((currentStep + 1) / (STEPS.length + 1)) * 100
    : (STEPS.length / (STEPS.length + 1)) * 100;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (submitted) {
    return (
      <AppLayout>
        <SuccessScreen />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 pt-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-card-foreground">CHED Graduate Tracer Study</h1>
          <p className="text-sm text-muted-foreground">
            Please complete all sections of this survey. Your responses help improve our programs.
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="flex flex-wrap gap-2">
            {STEPS.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = idx === currentStep;
              const isDone = idx < currentStep;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (isDone || idx <= currentStep) setCurrentStep(idx);
                  }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : isDone
                      ? 'bg-primary/15 dark:bg-primary/25 text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <StepIcon className="h-3.5 w-3.5" />
                  {step.label}
                </button>
              );
            })}
            {currentStep === STEPS.length && (
              <Badge variant="default" className="bg-primary text-white">
                Review
              </Badge>
            )}
          </div>
        </div>

        {/* Form */}
        <FormProvider {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="space-y-6"
          >
            <Card>
              <CardContent className="p-6">
                {currentStep === 0 && <Step1GeneralInfo />}
                {currentStep === 1 && <Step2EducationalBackground />}
                {currentStep === 2 && <Step3Trainings />}
                {currentStep === 3 && <Step4Employment />}
                {currentStep === 4 && <Step5SkillsFeedback />}
                {currentStep === STEPS.length && <ReviewScreen onEdit={handleEditFromReview} />}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div>
                {currentStep > 0 && (
                  <Button type="button" variant="outline" onClick={handlePrev} disabled={isSaving || isSubmitting}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {isSaving && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Saving draft...
                  </span>
                )}

                {currentStep < STEPS.length ? (
                  <Button type="button" onClick={handleNext} disabled={isSaving}>
                    {currentStep === STEPS.length - 1 ? 'Review' : 'Next'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmitFinal} disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Submit Survey
                  </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </AppLayout>
  );
}
