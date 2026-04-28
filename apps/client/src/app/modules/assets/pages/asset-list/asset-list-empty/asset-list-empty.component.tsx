import VideoIcon from '@svgs/video.svg?react';
import UploadIcon from '@svgs/upload.svg?react';

import { Button } from '@/app/shared/components/button/button.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import { ButtonVariant } from '@/app/shared/models/button.models';

import './asset-list-empty.component.css';

type AssetListEmptyProps = {
	onUpload: () => void;
};

export function AssetListEmpty({ onUpload }: AssetListEmptyProps) {
	const { t } = useTranslation();

	return (
		<div className="asset-list-empty">
			<VideoIcon className="asset-list-empty__icon" />
			<p className="asset-list-empty__title">{t('assets.list.empty')}</p>
			<Button variant={ButtonVariant.PRIMARY} onClick={onUpload}>
				<UploadIcon width={14} height={14} />
				{t('assets.list.uploadCta')}
			</Button>
		</div>
	);
}
