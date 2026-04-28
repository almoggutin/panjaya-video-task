import { useCallback, useMemo } from 'react';
import type { ReactElement } from 'react';
import ChevronDownIcon from '@svgs/chevron-down.svg?react';
import SortIcon from '@svgs/sort.svg?react';

import { TableSortDir, type ITableColumn } from '@/app/shared/models/table.models';

import './table-header.component.css';

type TableHeaderProps = {
	columns: ITableColumn[];
};

export function TableHeader({ columns }: TableHeaderProps) {
	const getClassName = useCallback((col: ITableColumn): string | undefined => {
		const sortable: string = col.sortable ? 'table__th--sortable' : '';
		const sorted: string = col.sortable && col.sortDir !== undefined ? 'table__th--sorted' : '';

		const classes: string = [sortable, sorted].filter(Boolean).join(' ');
		return classes || undefined;
	}, []);

	const getSortIcon = useCallback((sortDir: TableSortDir | undefined): ReactElement => {
		if (sortDir === TableSortDir.ASC)
			return <ChevronDownIcon width={10} height={10} style={{ transform: 'rotate(180deg)' }} />;
		if (sortDir === TableSortDir.DESC) return <ChevronDownIcon width={10} height={10} />;
		return <SortIcon width={10} height={10} />;
	}, []);

	const thClassNames = useMemo(() => columns.map((col) => getClassName(col)), [columns, getClassName]);

	return (
		<thead>
			<tr>
				{columns.map((col, i) => (
					<th key={col.key} className={thClassNames[i]} onClick={col.sortable ? col.onSort : undefined}>
						{col.header}

						{col.sortable && <span className="table__sort-icon">{getSortIcon(col.sortDir)}</span>}
					</th>
				))}
			</tr>
		</thead>
	);
}
