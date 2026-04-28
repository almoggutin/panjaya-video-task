import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import { Button } from '@/app/shared/components/button/button.component';
import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';

import './upload-progress-bar.component.css';

type UploadProgressBarProps = {
	filename: string;
	progress: number;
	onCancel: () => void;
};

export function UploadProgressBar({ filename, progress, onCancel }: UploadProgressBarProps) {
	const { t } = useTranslation();

	const pct: number = Math.round(progress * 100);

	return (
		<div className="upload-progress">
			<header className="upload-progress__header">
				<span className="upload-progress__filename">{filename}</span>
				<span className="upload-progress__pct">{pct}%</span>
			</header>

			<main className="upload-progress__track">
				<div className="upload-progress__fill" style={{ width: `${pct}%` }} />
			</main>

			<footer className="upload-progress__footer">
				<span className="upload-progress__label">{t('assets.upload.uploading')}</span>

				<Button variant={ButtonVariant.DEFAULT} size={ButtonSize.SM} onClick={onCancel}>
					{t('assets.upload.cancel')}
				</Button>
			</footer>
		</div>
	);
}
