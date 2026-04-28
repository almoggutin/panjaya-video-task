import { useNavigate } from 'react-router-dom';

import type { IAsset } from '../../models/asset.models';
import { AssetStatus } from '../../models/asset.models';
import { PROCESSING_STEPS } from '../../constants/asset-processing.constants';
import { useAsset } from '../../hooks/asset-detail.hook';
import { useAssetEvents } from '../../hooks/asset-events.hook';
import { ProcessingDialogHeader } from './processing-dialog-header/processing-dialog-header.component';
import { ProcessingDialogBody } from './processing-dialog-body/processing-dialog-body.component';
import { ProcessingDialogFooter } from './processing-dialog-footer/processing-dialog-footer.component';

type ProcessingDialogProps = {
	asset: IAsset;
	onClose: () => void;
};

export function ProcessingDialog({ asset: initialAsset, onClose }: ProcessingDialogProps) {
	const navigate = useNavigate();
	const { data: asset = initialAsset } = useAsset(initialAsset.id);
	const { progress } = useAssetEvents(initialAsset.id);

	const currentIdx: number = (PROCESSING_STEPS as ReadonlyArray<AssetStatus>).indexOf(asset.status);
	const isStreaming: boolean = asset.status !== AssetStatus.READY;

	const handleOpen = () => {
		onClose();
		navigate(`/assets/${initialAsset.id}`);
	};

	return (
		<>
			<ProcessingDialogHeader
				title={asset.title}
				status={asset.status}
				isStreaming={isStreaming}
				onClose={onClose}
			/>
			<ProcessingDialogBody status={asset.status} currentIdx={currentIdx} progress={progress} />
			<ProcessingDialogFooter status={asset.status} onClose={onClose} onOpen={handleOpen} />
		</>
	);
}
