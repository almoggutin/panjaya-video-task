import { z } from 'zod';

export const LoginSchema = z.object({
	email: z.string().email('auth.errors.invalidEmail'),
	password: z.string().min(1, 'auth.errors.required'),
});

export type LoginForm = z.infer<typeof LoginSchema>;
