import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import {
	DEFAULT_LANGUAGE,
	SUPPORTED_LANGUAGES,
	TRANSLATION_RESOURCES,
} from '@/app/core/constants/localization.constants';
import { StorageKey } from '@/app/core/models/storage.models';

export const initializeI18n = () =>
	i18next
		.use(LanguageDetector)
		.use(initReactI18next)
		.init({
			resources: TRANSLATION_RESOURCES,
			fallbackLng: DEFAULT_LANGUAGE,
			supportedLngs: SUPPORTED_LANGUAGES,
			interpolation: { escapeValue: false },
			detection: {
				order: ['localStorage', 'navigator'],
				lookupLocalStorage: StorageKey.LANGUAGE,
				caches: ['localStorage'],
			},
		});
