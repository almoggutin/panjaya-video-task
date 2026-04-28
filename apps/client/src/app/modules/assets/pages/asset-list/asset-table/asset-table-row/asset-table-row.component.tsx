import { useNavigate } from 'react-router-dom';
import PlayIcon from '@svgs/play.svg?react';
import XIcon from '@svgs/x.svg?react';
import { TableRow } from '@/app/shared/components/table/table-row/table-row.component';
import { TableCell } from '@/app/shared/components/table/table-cell/table-cell.component';

import type { IAsset } from '../../../../models/asset.models';
import { AssetStatus } from '../../../../models/asset.models';
import { PROCESSING_STATES, STATE_CHIP_VARIANT } from '../../../../constants/asset-table-row.constants';
import { ProcessingDialog } from '../../../../components/processing-dialog/processing-dialog.component';
import { Chip } from '@/app/shared/components/chip/chip.component';
import { RowMenu } from '../row-menu/row-menu.component';
import { DeleteConfirmDialog } from './delete-confirm-dialog/delete-confirm-dialog.component';
import { useDialog } from '@/app/shared/hooks/dialog.hook';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import { Utils } from '@/app/core/utils/common.utils';

import './asset-table-row.component.css';

type AssetTableRowProps = {
	asset: IAsset;
};

export function AssetTableRow({ asset }: AssetTableRowProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { openDialog, closeDialog } = useDialog();

	const sameDay: boolean = asset.createdAt.slice(0, 10) === asset.updatedAt.slice(0, 10);
	const extension: string = asset.originalFilename.split('.').pop()?.toUpperCase() ?? '';
	const isActivelyProcessing: boolean =
		asset.status === AssetStatus.EXTRACTING ||
		asset.status === AssetStatus.TRANSFORMING ||
		asset.status === AssetStatus.FINALIZING;

	const handleRowClick = () => {
		if (asset.status === AssetStatus.FAILED) return;
		if (PROCESSING_STATES.has(asset.status)) {
			openDialog(<ProcessingDialog asset={asset} onClose={closeDialog} />, 'dialog--lg');
			return;
		}

		navigate(`/assets/${asset.id}`);
	};

	return (
		<TableRow className="asset-row" onClick={handleRowClick}>
			<TableCell className="asset-row__thumbnail">
				<div className="asset-row__thumb">
					{asset.thumbnailUrl && <img className="asset-row__thumb-img" src={asset.thumbnailUrl} alt="" />}
					{asset.status === AssetStatus.READY && (
						<div className="asset-row__thumb-overlay asset-row__thumb-overlay--ready">
							<PlayIcon width={12} height={12} />
						</div>
					)}
					{isActivelyProcessing && (
						<div className="asset-row__thumb-overlay asset-row__thumb-overlay--processing">
							<div className="asset-row__thumb-spinner" />
						</div>
					)}
					{asset.status === AssetStatus.QUEUED && (
						<div className="asset-row__thumb-overlay asset-row__thumb-overlay--queued">
							<div className="asset-row__thumb-spinner" />
						</div>
					)}
					{asset.status === AssetStatus.FAILED && (
						<div className="asset-row__thumb-overlay asset-row__thumb-overlay--failed">
							<XIcon width={14} height={14} />
						</div>
					)}
				</div>
			</TableCell>

			<TableCell className="asset-row__name">
				<span className="asset-row__title">{asset.title}</span>
				<span className="asset-row__filename">{asset.originalFilename}</span>
			</TableCell>

			<TableCell className="asset-row__format">
				<span className="asset-row__format-badge">{extension}</span>
			</TableCell>

			<TableCell className="asset-row__date" title={asset.createdAt}>
				{Utils.formatDate(asset.createdAt)}
			</TableCell>

			<TableCell className="asset-row__date" title={asset.updatedAt}>
				{sameDay ? '—' : Utils.formatDate(asset.updatedAt)}
			</TableCell>

			<TableCell className="asset-row__state">
				<Chip variant={STATE_CHIP_VARIANT[asset.status]} dot pulse={PROCESSING_STATES.has(asset.status)}>
					{t(`assets.states.${asset.status}` as Parameters<typeof t>[0])}
				</Chip>
			</TableCell>

			<TableCell className="asset-row__actions" onClick={(e) => e.stopPropagation()}>
				<RowMenu
					className="asset-row__menu"
					asset={asset}
					onDelete={() => openDialog(<DeleteConfirmDialog asset={asset} onClose={closeDialog} />)}
				/>
			</TableCell>
		</TableRow>
	);
}
