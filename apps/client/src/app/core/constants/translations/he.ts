import { coreHeTranslation } from '@/app/core/i18n/he';
import { assetsHeTranslation } from '@/app/modules/assets/i18n/he';
import { authHeTranslation } from '@/app/modules/auth/i18n/he';
import { landingHeTranslation } from '@/app/modules/landing/i18n/he';
import { userHeTranslation } from '@/app/modules/user/i18n/he';

export const he = {
	...coreHeTranslation,
	...authHeTranslation,
	...assetsHeTranslation,
	...userHeTranslation,
	...landingHeTranslation,
} as const;
