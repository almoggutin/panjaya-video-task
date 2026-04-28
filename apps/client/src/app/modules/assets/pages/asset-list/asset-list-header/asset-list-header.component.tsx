import UploadIcon from '@svgs/upload.svg?react';

import { Button } from '@/app/shared/components/button/button.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import { ButtonVariant } from '@/app/shared/models/button.models';

import './asset-list-header.component.css';

type AssetListHeaderProps = {
	search: string;
	onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onUpload: () => void;
};

export function AssetListHeader({ search, onSearch, onUpload }: AssetListHeaderProps) {
	const { t } = useTranslation();

	return (
		<div className="asset-list__header">
			<h2>{t('assets.list.title')}</h2>

			<div className="asset-list__header-actions">
				<input
					className="asset-list__search"
					placeholder={t('assets.list.search')}
					value={search}
					onChange={onSearch}
				/>

				<Button variant={ButtonVariant.PRIMARY} onClick={onUpload}>
					<UploadIcon width={14} height={14} />
					<span>{t('assets.list.uploadCta')}</span>
				</Button>
			</div>
		</div>
	);
}
