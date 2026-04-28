import VideoIcon from '@svgs/video.svg?react';

import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './asset-list-no-results.component.css';

export function AssetListNoResults() {
	const { t } = useTranslation();

	return (
		<div className="asset-list-no-results">
			<VideoIcon className="asset-list-no-results__icon" />
			<p className="asset-list-no-results__title">{t('assets.list.noResults')}</p>
		</div>
	);
}
