import { SortKey, type ISortableColumn } from '../models/asset-table.models';

export const SORTABLE_COLUMNS: ISortableColumn[] = [
	{ key: SortKey.TITLE, labelKey: 'assets.list.columns.name' },
	{ key: SortKey.ORIGINAL_EXTENSION, labelKey: 'assets.list.columns.format' },
	{ key: SortKey.CREATED_AT, labelKey: 'assets.list.columns.created' },
	{ key: SortKey.UPDATED_AT, labelKey: 'assets.list.columns.updated' },
];
