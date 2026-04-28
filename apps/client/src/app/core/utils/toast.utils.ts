import type { IPushToastOptions } from '@/app/core/models/theme.models';

export function resolveToastMessage(options: IPushToastOptions): string {
	if (options.message) return options.message;
	if (options.error instanceof Error) return options.error.message;
	return 'common.errors.serverError';
}
