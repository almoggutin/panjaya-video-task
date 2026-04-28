import { useTranslation as useI18nTranslation } from 'react-i18next';

import { Language } from '@/app/core/models/localization.models';
import type { Translation } from '@/app/core/models/localization.models';

type NestedKeyOf<T> = T extends object
	? { [K in keyof T]: K extends string ? (T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : K) : never }[keyof T]
	: never;

export type TranslationKey = NestedKeyOf<Translation>;

export const useTranslation = () => {
	const { t, i18n } = useI18nTranslation();

	return {
		t: t as (key: TranslationKey, options?: Record<string, unknown>) => string,
		language: i18n.language as Language,
		changeLanguage: (lang: Language) => i18n.changeLanguage(lang),
		isRTL: i18n.language === Language.HE,
	};
};
