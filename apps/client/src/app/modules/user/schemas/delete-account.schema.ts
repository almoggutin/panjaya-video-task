import { z } from 'zod';

export const DeleteAccountBaseSchema = z.object({
	email: z.string().min(1, 'auth.errors.required'),
});

export type DeleteAccountForm = z.infer<typeof DeleteAccountBaseSchema>;

export const createDeleteAccountSchema = (expectedEmail: string) =>
	DeleteAccountBaseSchema.refine((data) => data.email === expectedEmail, {
		message: 'user.profile.deleteAccount.emailMismatch',
		path: ['email'],
	});
