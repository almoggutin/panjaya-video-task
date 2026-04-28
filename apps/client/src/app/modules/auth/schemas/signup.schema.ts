import { z } from 'zod';

export const SignupSchema = z
	.object({
		firstName: z.string().min(1, 'auth.errors.required'),
		lastName: z.string().min(1, 'auth.errors.required'),
		email: z.string().email('auth.errors.invalidEmail'),
		password: z.string().min(8, 'auth.errors.passwordMin'),
		confirm: z.string(),
	})
	.refine((data) => data.password === data.confirm, {
		path: ['confirm'],
		message: 'auth.errors.passwordMismatch',
	});

export type SignupForm = z.infer<typeof SignupSchema>;
