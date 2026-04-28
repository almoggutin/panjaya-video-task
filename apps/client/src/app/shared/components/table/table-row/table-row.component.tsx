import type { ReactNode } from 'react';

import './table-row.component.css';

type TableRowProps = {
	children: ReactNode;
	onClick?: () => void;
	className?: string;
};

export function TableRow({ children, onClick, className }: TableRowProps) {
	return (
		<tr className={`table-row${className ? ` ${className}` : ''}`} onClick={onClick}>
			{children}
		</tr>
	);
}
