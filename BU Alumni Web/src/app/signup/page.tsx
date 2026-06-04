'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordStrength } from '@/components/password-strength';
import { createClient } from '@/lib/supabase/client';
import { SignupSchema, type SignupInput } from '@/lib/schemas/signup';
import { logAuditEvent } from '@/lib/audit';
import { Loader2, Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

/* ─── Floating Orb ─── */
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
      animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

const COLLEGES = [
  'College of Liberal Arts and General Education (CLAGE)',
  'College of Business Administration and Accountancy (CBAA)',
  'College of Education and Human Development (CEHD)',
  'College of Environmental Design and Engineering (CEDE)',
  'College of Nursing and Allied Health Sciences (CNAHS)',
  'College of Information Technology Education (CITE)',
  'College of Hospitality Management and Tourism (CHMT)',
  'School of Graduate Studies',
];

const COURSES_BY_COLLEGE: Record<string, string[]> = {
  'College of Liberal Arts and General Education (CLAGE)': [
    'Bachelor of Arts in Communication',
    'Bachelor of Arts in Communication and Bachelor of Arts in Journalism',
    'Bachelor of Arts in Political Science',
  ],
  'College of Business Administration and Accountancy (CBAA)': [
    'Bachelor of Science in Accountancy',
    'Bachelor of Science in Management Accounting',
    'Bachelor of Science in Business Administration',
  ],
  'College of Education and Human Development (CEHD)': [
    'Bachelor of Early Childhood Education',
    'Bachelor of Elementary Education',
    'Bachelor of Secondary Education',
    'Bachelor of Physical Education',
    'Bachelor of Library and Information Science',
    'Bachelor of Science in Psychology',
    'Bachelor of Science in Social Work',
    'Certificate in Teacher Education',
    'Post-Baccalaureate Diploma in Alternative Learning System',
  ],
  'College of Environmental Design and Engineering (CEDE)': [
    'Bachelor of Science in Civil Engineering',
    'Bachelor of Science in Computer Engineering',
    'Bachelor of Science in Electrical Engineering',
    'Bachelor of Science in Electronics Engineering',
    'Bachelor of Science in Industrial Engineering',
    'Bachelor of Science in Mechanical Engineering',
  ],
  'College of Nursing and Allied Health Sciences (CNAHS)': [
    'Bachelor of Science in Nursing',
    'Bachelor of Science in Nutrition and Dietetics',
    'Bachelor of Science in Medical Technology/Medical Laboratory Science',
  ],
  'College of Information Technology Education (CITE)': [
    'Associate in Computer Technology',
    'Bachelor of Science in Computer Science',
    'Bachelor of Science in Information Technology',
  ],
  'College of Hospitality Management and Tourism (CHMT)': [
    'Bachelor of Science in Hospitality Management',
    'Bachelor of Science in Tourism Management',
  ],
  'School of Graduate Studies': [
    'Doctor of Education',
    'Doctor of Business Administration',
    'Master in Business Administration',
    'Master in Public Administration',
    'Master of Library & Information Science',
    'Master of Arts in Nursing',
    'Master of Science in Nursing',
    'Master of Science in Hospitality & Tourism Management',
    'Master of Arts in Education',
    'Master of Arts in Teaching',
    'Master in Information Technology',
  ],
};

const BATCH_YEARS = Array.from(
  { length: new Date().getFullYear() - 1989 },
  (_, i) => 1990 + i
).reverse();

export default function SignupPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      college: '',
      degree: '',
      batchYear: new Date().getFullYear(),
      agreedToTerms: false,
    },
    mode: 'onBlur',
  });

  const password = form.watch('password');
  const selectedCollege = form.watch('college');

  useEffect(() => {
    if (selectedCollege) {
      form.setValue('degree', '');
    }
  }, [selectedCollege, form]);

  const onSubmit = async (values: SignupInput) => {
    if (attempts >= 3) {
      setError('Too many attempts. Please try again later.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName.trim(),
            middle_name: values.middleName.trim() || null,
            last_name: values.lastName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setLoading(false);
        setAttempts((a) => a + 1);
        setError(signUpError.message);
        await logAuditEvent('signup_failed', 'auth', undefined, { email: values.email, error: signUpError.message });
        return;
      }

      // Update profile with college, degree, batch year
      const user = signUpData.user;
      if (user) {
        const { error: profileError } = await supabase.from('profiles').update({
          college: values.college,
          degree: values.degree,
          batch_year: values.batchYear,
        }).eq('id', user.id);
        if (profileError) {
          console.error('Profile update error:', profileError);
        }
        await logAuditEvent('signup_success', 'auth', user.id, { email: values.email });
      }

      setLoading(false);
      router.push('/login?confirmed=check-email');
    } catch (err: any) {
      console.error('Signup error:', err);
      setLoading(false);
      setAttempts((a) => a + 1);
      setError(err?.message || 'An unexpected error occurred. Please check your internet connection and try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background p-4 py-10">
      {/* Background orbs */}
      <FloatingOrb className="w-[500px] h-[500px] bg-primary/30 -top-20 -left-20" delay={0} />
      <FloatingOrb className="w-[400px] h-[400px] bg-meadow/25 bottom-0 right-0" delay={2} />
      <FloatingOrb className="w-[300px] h-[300px] bg-emerald/20 top-1/3 right-1/4" delay={4} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        {/* Back to home */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-20 w-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-meadow flex items-center justify-center p-2 shadow-xl shadow-primary/20"
          >
            <img src="/logos/bu.png" alt="Baliuag University" className="h-full w-full object-contain" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-3xl font-display font-bold text-foreground"
          >
            BU Alumni
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-muted-foreground mt-1"
          >
            Create your alumni account
          </motion.p>
        </div>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl bg-card border border-border shadow-xl shadow-primary/5 p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">Join the Community</h2>
              <p className="text-xs text-muted-foreground">Complete the form below to get started</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Name fields */}
              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Juan"
                          className="bg-input border-input focus:border-primary focus:ring-primary/20 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Middle Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Optional"
                          className="bg-input border-input focus:border-primary focus:ring-primary/20 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dela Cruz"
                          className="bg-input border-input focus:border-primary focus:ring-primary/20 transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="bg-input border-input focus:border-primary focus:ring-primary/20 transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="At least 8 characters"
                          className="bg-input border-input focus:border-primary focus:ring-primary/20 transition-all pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    {password && <PasswordStrength password={password} />}
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Repeat your password"
                          className="bg-input border-input focus:border-primary focus:ring-primary/20 transition-all pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showConfirm ? 'Hide password' : 'Show password'}
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* College & Degree */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="college"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">College / School</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-input border-input focus:border-primary focus:ring-primary/20">
                            <SelectValue placeholder="Select college" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COLLEGES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/80">Degree</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCollege}>
                        <FormControl>
                          <SelectTrigger className="bg-input border-input focus:border-primary focus:ring-primary/20">
                            <SelectValue placeholder={selectedCollege ? 'Select degree' : 'Select college first'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <ScrollArea className="h-60">
                            {selectedCollege &&
                              COURSES_BY_COLLEGE[selectedCollege]?.map((course) => (
                                <SelectItem key={course} value={course}>
                                  {course}
                                </SelectItem>
                              ))}
                          </ScrollArea>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Batch Year */}
              <FormField
                control={form.control}
                name="batchYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Batch Year</FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger className="bg-input border-input focus:border-primary focus:ring-primary/20">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BATCH_YEARS.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Terms */}
              <FormField
                control={form.control}
                name="agreedToTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm text-foreground/80">
                        I agree to the{' '}
                        <a href="https://baliuagu.edu.ph/posts/baliuag-university-data-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-emerald font-medium transition-colors">
                          Privacy Policy
                        </a>{' '}
                        and{' '}
                        <Link href="/terms" className="text-primary hover:text-emerald font-medium transition-colors">
                          Terms of Service
                        </Link>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-emerald text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] h-11"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Account
              </Button>
            </form>
          </Form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:text-emerald transition-colors">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
