import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
	email: z.string().email('auth.errors.invalidEmail'),
});

export type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;
