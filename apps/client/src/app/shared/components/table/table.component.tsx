import type { ReactNode } from 'react';

import { TableHeader } from './table-header/table-header.component';
import type { ITableColumn } from '@/app/shared/models/table.models';
import './table.component.css';

type TableProps = {
	columns: ITableColumn[];
	children: ReactNode;
	className?: string;
};

export function Table({ columns, children, className }: TableProps) {
	return (
		<div className={`table-wrap${className ? ` ${className}` : ''}`}>
			<table className="table">
				<TableHeader columns={columns} />
				<tbody>{children}</tbody>
			</table>
		</div>
	);
}
