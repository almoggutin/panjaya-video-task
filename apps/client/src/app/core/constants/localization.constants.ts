import { en } from './translations/en';
import { he } from './translations/he';

import { Language } from '@/app/core/models/localization.models';

export const TRANSLATION_RESOURCES = {
	en: { translation: en },
	he: { translation: he },
} as const;

export const SUPPORTED_LANGUAGES: Language[] = [Language.EN, Language.HE];

export const DEFAULT_LANGUAGE: Language = Language.EN;
