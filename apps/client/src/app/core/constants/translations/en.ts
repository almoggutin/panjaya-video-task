import { coreEnTranslation } from '@/app/core/i18n/en';
import { assetsEnTranslation } from '@/app/modules/assets/i18n/en';
import { authEnTranslation } from '@/app/modules/auth/i18n/en';
import { landingEnTranslation } from '@/app/modules/landing/i18n/en';
import { userEnTranslation } from '@/app/modules/user/i18n/en';

export const en = {
	...coreEnTranslation,
	...authEnTranslation,
	...assetsEnTranslation,
	...userEnTranslation,
	...landingEnTranslation,
} as const;
