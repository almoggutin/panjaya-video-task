import type { ReactNode } from 'react';

export enum TableSortDir {
	ASC = 'asc',
	DESC = 'desc',
}

export interface ITableColumn {
	key: string;
	header: ReactNode;
	sortable?: boolean;
	sortDir?: TableSortDir;
	onSort?: () => void;
}
