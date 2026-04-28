import { useCallback } from 'react';

import { dismissToast } from '@/app/core/slices/ui.slice';
import { useAppDispatch, useAppSelector } from '@/app/core/store/hooks';

import { ToastItem } from './toast-item/toast-item.component';

import './toast.component.css';

export function ToastContainer() {
	const dispatch = useAppDispatch();
	const toasts = useAppSelector((state) => state.ui.toastQueue);

	const handleDismiss = useCallback((id: string) => dispatch(dismissToast(id)), [dispatch]);

	if (!toasts.length) return null;

	return (
		<div className="toast-container">
			{toasts.map((toast) => (
				<ToastItem key={toast.id} toast={toast} onDismiss={handleDismiss} />
			))}
		</div>
	);
}
