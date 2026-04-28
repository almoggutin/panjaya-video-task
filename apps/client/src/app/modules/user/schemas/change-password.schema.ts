import { z } from 'zod';

export const ChangePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'auth.errors.required'),
		newPassword: z.string().min(8, 'auth.errors.passwordMin'),
		confirm: z.string(),
	})
	.refine((data) => data.newPassword === data.confirm, {
		path: ['confirm'],
		message: 'auth.errors.passwordMismatch',
	});

export type ChangePasswordForm = z.infer<typeof ChangePasswordSchema>;
