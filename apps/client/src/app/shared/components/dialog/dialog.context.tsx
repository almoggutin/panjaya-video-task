import { createContext, useCallback, useState, type ReactNode } from 'react';

import { Dialog } from './dialog.component';
import type { IDialogContext, IDialogState } from '@/app/shared/models/dialog.models';

type DialogProviderProps = {
	children: ReactNode;
};

export const DialogContext = createContext<IDialogContext | null>(null);

export function DialogProvider({ children }: DialogProviderProps) {
	const [state, setState] = useState<IDialogState | null>(null);

	const openDialog = useCallback((node: ReactNode, className?: string) => setState({ content: node, className }), []);
	const closeDialog = useCallback(() => setState(null), []);

	return (
		<DialogContext.Provider value={{ openDialog, closeDialog }}>
			{children}

			<Dialog isOpen={state !== null} onClose={closeDialog} className={state?.className}>
				{state?.content}
			</Dialog>
		</DialogContext.Provider>
	);
}
