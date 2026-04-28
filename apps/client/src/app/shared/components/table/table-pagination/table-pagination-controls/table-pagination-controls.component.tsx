import type { ReactNode } from 'react';
import ArrowIcon from '@svgs/arrow.svg?react';

import { Button } from '@/app/shared/components/button/button.component';
import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';

import './table-pagination-controls.component.css';

type TablePaginationControlsProps = {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	prevLabel?: ReactNode;
	nextLabel?: ReactNode;
};

export function TablePaginationControls({
	page,
	totalPages,
	onPageChange,
	prevLabel = 'Prev',
	nextLabel = 'Next',
}: TablePaginationControlsProps) {
	return (
		<div className="table-pagination__controls">
			<Button
				variant={ButtonVariant.DEFAULT}
				size={ButtonSize.SM}
				disabled={page <= 1}
				onClick={() => onPageChange(Math.max(1, page - 1))}
			>
				<ArrowIcon width={12} height={12} style={{ transform: 'rotate(180deg)' }} />
				{prevLabel}
			</Button>

			<div className="table-pagination__page-numbers">
				{Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber: number) => (
					<button
						key={pageNumber}
						type="button"
						className={`table-pagination__page-btn${pageNumber === page ? ' table-pagination__page-btn--active' : ''}`}
						onClick={() => onPageChange(pageNumber)}
					>
						{pageNumber}
					</button>
				))}
			</div>

			<Button
				variant={ButtonVariant.DEFAULT}
				size={ButtonSize.SM}
				disabled={page >= totalPages}
				onClick={() => onPageChange(Math.min(totalPages, page + 1))}
			>
				{nextLabel}
				<ArrowIcon width={12} height={12} />
			</Button>
		</div>
	);
}
