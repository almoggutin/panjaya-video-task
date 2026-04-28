import { z } from 'zod';

export const envSchema = z.object({
	// Vite built-in constants
	MODE: z.enum(['development', 'staging', 'production']),
	BASE_URL: z.string(),
	PROD: z.boolean(),
	DEV: z.boolean(),
	SSR: z.boolean(),

	// App environment variables
	VITE_API_URL: z.string().url('VITE_API_URL must be a valid URL'),
	VITE_GITHUB_URL: z.string().url('VITE_GITHUB_URL must be a valid URL'),
	VITE_MAX_UPLOAD_MB: z.coerce.number().positive('VITE_MAX_UPLOAD_MB must be a positive number').default(500),
});

export type Env = z.infer<typeof envSchema>;
