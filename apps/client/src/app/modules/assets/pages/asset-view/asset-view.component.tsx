import { useNavigate, useParams } from 'react-router-dom';

import { AssetStatus } from '../../models/asset.models';
import { useAsset } from '../../hooks/asset-detail.hook';
import { Player } from '../../components/player/player.component';
import { Loader } from '@/app/shared/components/loader/loader.component';
import { Utils } from '@/app/core/utils/common.utils';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import { AssetTopbar } from './asset-topbar/asset-topbar.component';
import { AssetTitleRow } from './asset-title-row/asset-title-row.component';
import { AssetMetaPanel } from './asset-meta-panel/asset-meta-panel.component';

import './asset-view.component.css';

export function AssetView() {
	const { t } = useTranslation();
	const { id } = useParams() as { id: string };
	const navigate = useNavigate();
	const { data: asset, isLoading } = useAsset(id);

	if (isLoading) return <Loader />;
	if (!asset) return null;

	const metaRows: [string, string][] = [
		['id', asset.id],
		['filename', asset.originalFilename],
		['format', asset.format],
		['size', asset.sizeBytes ? Utils.formatBytes(asset.sizeBytes) : '—'],
		['duration', asset.durationSec ? Utils.formatDuration(asset.durationSec) : '—'],
		['created', Utils.formatDate(asset.createdAt)],
		['updated', Utils.formatDate(asset.updatedAt)],
	];

	return (
		<div className="page">
			<div className="asset-view__container">
				<AssetTopbar
					videoUrl={asset.videoUrl}
					modifiedVideoUrl={asset.modifiedVideoUrl}
					onBack={() => navigate('/assets')}
				/>

				<AssetTitleRow
					title={asset.title}
					status={asset.status}
					description={asset.description}
				/>

				<div className="asset-view__grid">
					<div>
						{asset.status === AssetStatus.READY ? (
							<Player asset={asset} />
						) : (
							<div className="asset-view__not-ready panel">{t('assets.player.notReady')}</div>
						)}
					</div>

					<div className="asset-view__rail">
						<AssetMetaPanel
							format={asset.format}
							durationSec={asset.durationSec}
							thumbnailUrl={asset.thumbnailUrl ?? null}
							metaRows={metaRows}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
