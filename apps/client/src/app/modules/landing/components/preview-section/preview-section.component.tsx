import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import { PlayerPreview } from '../player-preview/player-preview.component';
import './preview-section.component.css';

export function PreviewSection() {
	const { t } = useTranslation();

	return (
		<section className="preview-section">
			<div className="container preview-section__inner">
				<div className="preview-section__header">
					<h2 className="preview-section__title">{t('landing.preview.title')}</h2>
					<p className="preview-section__subtitle">{t('landing.preview.description')}</p>
				</div>

				<PlayerPreview />
			</div>
		</section>
	);
}
