import { envSchema, type Env } from '@/app/core/schemas/env.schema';

const parseEnv = (): Env => {
	const result = envSchema.safeParse(import.meta.env);

	if (!result.success) {
		const formatted = result.error.errors.map((e) => `  ${e.path.join('.')}: ${e.message}`).join('\n');
		throw new Error(`Missing or invalid environment variables:\n${formatted}`);
	}

	return result.data;
};

export const env: Env = parseEnv();
