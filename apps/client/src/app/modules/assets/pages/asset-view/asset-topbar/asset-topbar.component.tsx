import ArrowIcon from '@svgs/arrow.svg?react';
import DownloadIcon from '@svgs/download.svg?react';

import './asset-topbar.component.css';

type AssetTopbarProps = {
	videoUrl: string | null;
	modifiedVideoUrl: string | null;
	onBack: () => void;
};

export function AssetTopbar({ videoUrl, modifiedVideoUrl, onBack }: AssetTopbarProps) {
	return (
		<div className="asset-topbar">
			<button
				type="button"
				className="icon-btn asset-topbar__back"
				title="Back to library"
				onClick={onBack}
			>
				<ArrowIcon width={18} height={18} style={{ transform: 'rotate(180deg)' }} />
			</button>

			<div className="asset-topbar__export-btns">
				{videoUrl && (
					<a className="btn btn-ghost btn-sm" href={videoUrl} download>
						<DownloadIcon width={12} height={12} /> Export original
					</a>
				)}
				{modifiedVideoUrl && (
					<a className="btn btn-ghost btn-sm" href={modifiedVideoUrl} download>
						<DownloadIcon width={12} height={12} /> Export modified
					</a>
				)}
			</div>
		</div>
	);
}
