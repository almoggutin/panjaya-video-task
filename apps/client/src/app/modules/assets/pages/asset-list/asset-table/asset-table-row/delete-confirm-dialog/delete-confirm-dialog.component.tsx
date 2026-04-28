import XIcon from '@svgs/x.svg?react';

import { useDeleteAsset } from '../../../../../hooks/delete-asset.hook';
import type { IAsset } from '../../../../../models/asset.models';
import { Button } from '@/app/shared/components/button/button.component';
import { Spinner } from '@/app/shared/components/spinner/spinner.component';
import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './delete-confirm-dialog.component.css';

type DeleteConfirmDialogProps = {
	asset: IAsset;
	onClose: () => void;
};

export function DeleteConfirmDialog({ asset, onClose }: DeleteConfirmDialogProps) {
	const { t } = useTranslation();
	const { mutate: deleteAsset, isPending } = useDeleteAsset();

	const handleDelete = (): void => {
		deleteAsset(asset.id, { onSuccess: onClose });
	};

	return (
		<>
			<header className="dialog__header">
				<h3 style={{ color: 'var(--danger)' }}>{t('assets.actions.deleteTitle')}</h3>
				<button type="button" className="icon-btn" onClick={onClose}>
					<XIcon width={14} height={14} />
				</button>
			</header>

			<section className="dialog__body">
				<p className="asset-delete-dialog__desc">
					<strong>{asset.title}</strong> — {t('assets.actions.deleteBody')}
				</p>
			</section>

			<footer className="dialog__footer">
				<Button variant={ButtonVariant.DEFAULT} size={ButtonSize.SM} onClick={onClose} disabled={isPending}>
					{t('common.buttons.cancel')}
				</Button>

				<Button variant={ButtonVariant.DANGER} size={ButtonSize.SM} onClick={handleDelete} disabled={isPending}>
					{isPending ? <Spinner /> : t('assets.actions.deletePermanently')}
				</Button>
			</footer>
		</>
	);
}
