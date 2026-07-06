import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().optional().or(z.literal('')),
  studentId: z.string().regex(/^\d{7}$/, 'Student ID must be exactly 7 digits').optional().or(z.literal('')),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof LoginSchema>;
