import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import { useDeleteUser } from '../../../hooks/delete-user.hook';
import { createDeleteAccountSchema, type DeleteAccountForm } from '../../../schemas/delete-account.schema';

import { Button } from '@/app/shared/components/button/button.component';
import { FormField } from '@/app/shared/components/form-field/form-field.component';
import { Spinner } from '@/app/shared/components/spinner/spinner.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';

import './delete-account-dialog.component.css';

type DeleteAccountDialogProps = {
	email: string;
	onClose: () => void;
};

export function DeleteAccountDialog({ email, onClose }: DeleteAccountDialogProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { mutate: deleteAccount, isPending } = useDeleteUser();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<DeleteAccountForm>({
		resolver: zodResolver(createDeleteAccountSchema(email)),
	});

	const handleClose = (): void => {
		reset();
		onClose();
	};

	const onSubmit = (): void => {
		deleteAccount(undefined, {
			onSuccess: () => {
				onClose();
				navigate('/auth/login', { replace: true });
			},
		});
	};

	return (
		<>
			<h3 className="delete-account-dialog__title">{t('user.profile.deleteAccount.title')}</h3>
			<p className="delete-account-dialog__body">{t('user.profile.deleteAccount.confirm')}</p>

			<form className="delete-account-dialog__form" onSubmit={handleSubmit(onSubmit)}>
				<FormField
					label="user.profile.identity.email"
					error={errors.email}
					type="email"
					autoComplete="email"
					{...register('email')}
				/>

				<div className="delete-account-dialog__actions">
					<Button
						type="button"
						variant={ButtonVariant.DEFAULT}
						size={ButtonSize.MD}
						onClick={handleClose}
						disabled={isPending}
					>
						{t('common.buttons.cancel')}
					</Button>

					<Button type="submit" variant={ButtonVariant.DANGER} size={ButtonSize.MD} disabled={isPending}>
						{isPending ? <Spinner /> : t('common.buttons.delete')}
					</Button>
				</div>
			</form>
		</>
	);
}
