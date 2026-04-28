import { useEffect, useRef, type ReactNode } from 'react';

import './dialog.component.css';

type DialogProps = {
	isOpen: boolean;
	onClose: () => void;
	children: ReactNode;
	className?: string;
};

export function Dialog({ isOpen, onClose, children, className }: DialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog: HTMLDialogElement | null = dialogRef.current;
		if (!dialog) return;

		if (isOpen) return dialog.showModal();
		dialog.close();
	}, [isOpen]);

	return (
		<dialog ref={dialogRef} className={`dialog${className ? ` ${className}` : ''}`} onClose={onClose}>
			{children}
		</dialog>
	);
}
