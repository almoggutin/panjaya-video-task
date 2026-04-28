import type { TranslationKey } from '@/app/shared/hooks/i18n.hook';

export const STRENGTH_COLORS = ['var(--danger)', 'var(--warn)', 'var(--bronze)', 'var(--ok)'] as const;

export const STRENGTH_LABELS: TranslationKey[] = [
	'auth.strength.weak',
	'auth.strength.fair',
	'auth.strength.good',
	'auth.strength.strong',
];
