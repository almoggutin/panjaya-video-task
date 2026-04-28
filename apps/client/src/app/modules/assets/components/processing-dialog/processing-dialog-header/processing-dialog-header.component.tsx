import XIcon from '@svgs/x.svg?react';

import type { AssetStatus } from '../../../models/asset.models';
import { Chip } from '@/app/shared/components/chip/chip.component';
import { ChipVariant } from '@/app/shared/models/chip.models';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './processing-dialog-header.component.css';

type ProcessingDialogHeaderProps = {
	title: string;
	status: AssetStatus;
	isStreaming: boolean;
	onClose: () => void;
};

export function ProcessingDialogHeader({ title, status, isStreaming, onClose }: ProcessingDialogHeaderProps) {
	const { t } = useTranslation();

	return (
		<header className="dialog__header processing-dialog__header">
			<div className="processing-dialog__title">
				<h3>{title}</h3>
				<span className="processing-dialog__subtitle">
					{t(`assets.states.${status}` as Parameters<typeof t>[0])}
				</span>
			</div>
			{isStreaming && (
				<Chip variant={ChipVariant.BRONZE} dot pulse>
					streaming
				</Chip>
			)}
			<button type="button" className="icon-btn" onClick={onClose}>
				<XIcon width={14} height={14} />
			</button>
		</header>
	);
}
