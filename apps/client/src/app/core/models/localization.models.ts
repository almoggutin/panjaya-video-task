import type { TRANSLATION_RESOURCES } from '@/app/core/constants/localization.constants';
import type { Paths } from '@/app/shared/models/utility.models';

export enum Language {
	EN = 'en',
	HE = 'he',
}

export type Resources = typeof TRANSLATION_RESOURCES;

export type Translation = Resources[Language.EN]['translation'];

export type TranslationKey = Paths<Translation>;
