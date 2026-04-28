import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useChangePassword } from '../../../hooks/change-password.hook';
import { ChangePasswordSchema, type ChangePasswordForm } from '../../../schemas/change-password.schema';

import { pushToast } from '@/app/core/slices/ui.slice';
import { ToastType } from '@/app/core/models/theme.models';
import { useAppDispatch } from '@/app/core/store/hooks';
import { Button } from '@/app/shared/components/button/button.component';
import { PasswordField } from '@/app/shared/components/password-field/password-field.component';
import { PasswordStrength } from '@/app/shared/components/password-strength/password-strength.component';
import { Spinner } from '@/app/shared/components/spinner/spinner.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';

import './change-password-form.component.css';

export function ChangePasswordForm() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { mutate: changePassword, isPending } = useChangePassword();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
		reset,
	} = useForm<ChangePasswordForm>({
		resolver: zodResolver(ChangePasswordSchema),
	});

	const newPassword = watch('newPassword', '');

	const onSubmit = (data: ChangePasswordForm) => {
		changePassword(data, {
			onSuccess: () => {
				dispatch(pushToast({ type: ToastType.SUCCESS, message: t('user.profile.password.updateSuccess') }));
				reset();
			},
			onError: (err) => dispatch(pushToast({ type: ToastType.ERROR, error: err })),
		});
	};

	return (
		<form className="change-password-form" onSubmit={handleSubmit(onSubmit)}>
			<PasswordField
				label="user.profile.password.current"
				error={errors.currentPassword}
				autoComplete="current-password"
				{...register('currentPassword')}
			/>

			<PasswordField
				label="user.profile.password.new"
				error={errors.newPassword}
				autoComplete="new-password"
				hint={<PasswordStrength password={newPassword} />}
				{...register('newPassword')}
			/>

			<PasswordField
				label="user.profile.password.confirm"
				error={errors.confirm}
				autoComplete="new-password"
				{...register('confirm')}
			/>

			<div className="change-password-form__actions">
				<Button type="submit" variant={ButtonVariant.PRIMARY} size={ButtonSize.MD} disabled={isPending}>
					{isPending ? <Spinner /> : t('user.profile.password.updateButton')}
				</Button>
			</div>
		</form>
	);
}
