import { useCallback, useEffect } from 'react';

import type { IToast } from '@/app/core/models/theme.models';
import { TOAST_DURATION } from '@/app/shared/constants/ui.constants';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './toast-item.component.css';

type ToastItemProps = {
	toast: IToast;
	onDismiss: (id: string) => void;
};

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
	const { t } = useTranslation();
	const handleDismiss = useCallback(() => onDismiss(toast.id), [toast.id, onDismiss]);

	useEffect(() => {
		const timer = setTimeout(handleDismiss, TOAST_DURATION);
		return () => clearTimeout(timer);
	}, [handleDismiss]);

	return (
		<div className={`toast toast--${toast.type}`} role="alert">
			<span className="toast__message">{t(toast.message as Parameters<typeof t>[0])}</span>

			<button className="toast__close" onClick={handleDismiss}>
				×
			</button>
		</div>
	);
}
