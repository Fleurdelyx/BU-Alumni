import { z } from 'zod';

const nameField = z
  .string()
  .min(2, 'At least 2 characters')
  .max(50, 'Too long')
  .regex(/^[a-zA-ZÀ-ÿ\s\-'\.]+$/, 'Letters, hyphens, and apostrophes only');

export const SignupSchema = z
  .object({
    firstName: nameField,
    middleName: nameField.optional().or(z.literal('')),
    lastName: nameField,
    email: z.string().email('Invalid email address').toLowerCase(),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'One uppercase letter')
      .regex(/[a-z]/, 'One lowercase letter')
      .regex(/[0-9]/, 'One number')
      .regex(/[^a-zA-Z0-9]/, 'One special character'),
    confirmPassword: z.string(),
    college: z.string().min(1, 'Select your college'),
    degree: z.string().min(2, 'Enter your degree'),
    batchYear: z.coerce.number().int().min(1990).max(new Date().getFullYear()),
    agreedToTerms: z.literal(true, {
      errorMap: () => ({ message: 'You must agree to continue' }),
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupInput = z.infer<typeof SignupSchema>;
