import { AssetStatus } from '../../models/asset.models';
import { PROCESSING_STATES, STATE_CHIP_VARIANT } from '../../constants/asset-table-row.constants';
import { Chip } from '@/app/shared/components/chip/chip.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './processing-indicator.component.css';

type ProcessingIndicatorProps = {
	status: AssetStatus;
	progress: number;
	errorMessage?: string | null;
};

export function ProcessingIndicator({ status, progress, errorMessage }: ProcessingIndicatorProps) {
	const { t } = useTranslation();

	const isProcessing: boolean = PROCESSING_STATES.has(status);

	return (
		<div className="processing-indicator">
			<Chip variant={STATE_CHIP_VARIANT[status]} dot pulse={isProcessing}>
				{t(`assets.states.${status}` as Parameters<typeof t>[0])}
			</Chip>

			{isProcessing && (
				<div className="processing-indicator__progress">
					<div
						className="processing-indicator__progress-fill"
						style={{ width: `${Math.round(progress * 100)}%` }}
					/>
				</div>
			)}

			{status === AssetStatus.FAILED && errorMessage && (
				<p className="processing-indicator__error">{errorMessage}</p>
			)}
		</div>
	);
}
