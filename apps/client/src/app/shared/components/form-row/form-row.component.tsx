import type { ReactNode } from 'react';

import './form-row.component.css';

type FormRowProps = {
	children: ReactNode;
};

export function FormRow({ children }: FormRowProps) {
	return <div className="form-row">{children}</div>;
}
