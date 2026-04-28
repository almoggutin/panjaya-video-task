import TrashIcon from '@svgs/x.svg?react';

import { DeleteAccountDialog } from '../delete-account-dialog/delete-account-dialog.component';

import { Button } from '@/app/shared/components/button/button.component';
import { useDialog } from '@/app/shared/hooks/dialog.hook';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';

import './delete-account.component.css';

type DeleteAccountProps = {
	email: string;
};

export function DeleteAccount({ email }: DeleteAccountProps) {
	const { t } = useTranslation();
	const { openDialog, closeDialog } = useDialog();

	return (
		<div className="panel delete-account">
			<div className="panel-hd delete-account__hd">danger zone</div>
			<div className="delete-account__body">
				<h3 className="delete-account__title">{t('user.profile.deleteAccount.title')}</h3>
				<p className="delete-account__description">{t('user.profile.deleteAccount.confirm')}</p>

				<Button
					variant={ButtonVariant.DANGER}
					size={ButtonSize.SM}
					fullWidth
					onClick={() => openDialog(<DeleteAccountDialog email={email} onClose={closeDialog} />)}
				>
					<TrashIcon width={13} height={13} />
					{t('user.profile.deleteAccount.title')}
				</Button>
			</div>
		</div>
	);
}
