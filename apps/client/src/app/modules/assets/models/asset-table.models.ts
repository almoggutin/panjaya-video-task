import type { TranslationKey } from '@/app/shared/hooks/i18n.hook';

export enum SortKey {
	TITLE = 'title',
	ORIGINAL_EXTENSION = 'originalExtension',
	CREATED_AT = 'createdAt',
	UPDATED_AT = 'updatedAt',
}

export enum SortDir {
	ASC = 'asc',
	DESC = 'desc',
}

export interface ISortableColumn {
	key: SortKey;
	labelKey: TranslationKey;
}
