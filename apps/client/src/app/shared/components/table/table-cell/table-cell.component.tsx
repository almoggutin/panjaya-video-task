import type { ReactNode, TdHTMLAttributes } from 'react';

import './table-cell.component.css';

type TableCellProps = TdHTMLAttributes<HTMLTableCellElement> & {
	children?: ReactNode;
};

export function TableCell({ children, className, ...rest }: TableCellProps) {
	return (
		<td className={`table-cell${className ? ` ${className}` : ''}`} {...rest}>
			{children}
		</td>
	);
}
