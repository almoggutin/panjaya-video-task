import { z } from 'zod';

export const UpdateProfileSchema = z.object({
	firstName: z.string().min(1, 'auth.errors.required'),
	lastName: z.string().min(1, 'auth.errors.required'),
	email: z.string().email('auth.errors.invalidEmail'),
});

export type UpdateProfileForm = z.infer<typeof UpdateProfileSchema>;
