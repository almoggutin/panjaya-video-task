import AlertTriangleIcon from '@svgs/alert-triangle.svg?react';

import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './error-display.component.css';

type ErrorDisplayProps = {
	message?: string;
};

export function ErrorDisplay({ message }: ErrorDisplayProps) {
	const { t } = useTranslation();

	return (
		<div className="error-display">
			<AlertTriangleIcon className="error-display__icon" />
			<p className="error-display__title">{message ?? t('common.errors.serverError')}</p>
		</div>
	);
}
