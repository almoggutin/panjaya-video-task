import type { ReactNode } from 'react';

export interface IDialogContext {
	openDialog: (content: ReactNode, className?: string) => void;
	closeDialog: () => void;
}

export interface IDialogState {
	content: ReactNode;
	className?: string;
}
