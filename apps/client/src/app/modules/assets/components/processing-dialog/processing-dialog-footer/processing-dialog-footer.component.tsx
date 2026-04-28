import ArrowIcon from '@svgs/arrow.svg?react';

import { AssetStatus } from '../../../models/asset.models';
import { Button } from '@/app/shared/components/button/button.component';
import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './processing-dialog-footer.component.css';

type ProcessingDialogFooterProps = {
	status: AssetStatus;
	onClose: () => void;
	onOpen: () => void;
};

export function ProcessingDialogFooter({ status, onClose, onOpen }: ProcessingDialogFooterProps) {
	const { t } = useTranslation();

	return (
		<footer className="dialog__footer">
			<Button variant={ButtonVariant.DEFAULT} size={ButtonSize.SM} onClick={onClose}>
				{t('common.buttons.cancel')}
			</Button>
			{status === AssetStatus.READY && (
				<Button variant={ButtonVariant.PRIMARY} size={ButtonSize.SM} onClick={onOpen}>
					{t('assets.actions.openPlayer')}
					<ArrowIcon width={12} height={12} />
				</Button>
			)}
		</footer>
	);
}
