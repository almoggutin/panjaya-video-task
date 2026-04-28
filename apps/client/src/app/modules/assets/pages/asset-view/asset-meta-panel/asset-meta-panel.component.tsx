import { Utils } from '@/app/core/utils/common.utils';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './asset-meta-panel.component.css';

type AssetMetaPanelProps = {
	format: string;
	durationSec: number | null;
	thumbnailUrl: string | null;
	metaRows: [string, string][];
};

export function AssetMetaPanel({ format, durationSec, thumbnailUrl, metaRows }: AssetMetaPanelProps) {
	const { t } = useTranslation();

	return (
		<div className="asset-meta-panel panel">
			<div className="asset-meta-panel__thumb">
				{thumbnailUrl && <img className="asset-meta-panel__thumb-img" src={thumbnailUrl} alt="Thumbnail" />}

				<div className="asset-meta-panel__thumb-chip mono">{format}</div>
				<div className="asset-meta-panel__thumb-duration mono">
					{durationSec ? Utils.formatDuration(durationSec) : '—'}
				</div>
			</div>

			<div className="panel-hd">{t('assets.view.metadataHeading')}</div>
			<div className="panel-body asset-meta-panel__body">
				{metaRows.map(([k, v]) => (
					<div key={k} className="asset-meta-panel__row">
						<span className="mono asset-meta-panel__key">{k}</span>
						<span className="mono asset-meta-panel__val">{v}</span>
					</div>
				))}
			</div>
		</div>
	);
}
