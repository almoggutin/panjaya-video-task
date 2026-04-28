import type { ReactNode } from 'react';

import { TablePaginationControls } from './table-pagination-controls/table-pagination-controls.component';

import './table-pagination.component.css';

type TablePaginationProps = {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	info?: ReactNode;
	prevLabel?: ReactNode;
	nextLabel?: ReactNode;
	className?: string;
};

export function TablePagination({
	page,
	totalPages,
	onPageChange,
	info,
	prevLabel,
	nextLabel,
	className,
}: TablePaginationProps) {
	return (
		<div className={`table-pagination${className ? ` ${className}` : ''}`}>
			{info && <span className="table-pagination__info">{info}</span>}

			<TablePaginationControls
				page={page}
				totalPages={totalPages}
				onPageChange={onPageChange}
				prevLabel={prevLabel}
				nextLabel={nextLabel}
			/>
		</div>
	);
}
