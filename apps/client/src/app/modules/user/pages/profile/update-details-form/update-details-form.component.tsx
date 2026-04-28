import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useUpdateUser } from '../../../hooks/update-user.hook';
import { UpdateProfileSchema, type UpdateProfileForm } from '../../../schemas/update-profile.schema';
import type { IUser } from '../../../models/user.models';

import { pushToast } from '@/app/core/slices/ui.slice';
import { ToastType } from '@/app/core/models/theme.models';
import { useAppDispatch } from '@/app/core/store/hooks';
import { Button } from '@/app/shared/components/button/button.component';
import { FormField } from '@/app/shared/components/form-field/form-field.component';
import { FormRow } from '@/app/shared/components/form-row/form-row.component';
import { Spinner } from '@/app/shared/components/spinner/spinner.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';

import './update-details-form.component.css';

type UpdateDetailsFormProps = {
	user: IUser;
};

export function UpdateDetailsForm({ user }: UpdateDetailsFormProps) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const { mutate: update, isPending } = useUpdateUser();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<UpdateProfileForm>({
		resolver: zodResolver(UpdateProfileSchema),
		defaultValues: { firstName: user.firstName, lastName: user.lastName, email: user.email },
	});

	const onSubmit = (data: UpdateProfileForm): void => {
		update(data, {
			onSuccess: (updated) => {
				reset({ firstName: updated.firstName, lastName: updated.lastName, email: updated.email });
				dispatch(pushToast({ type: ToastType.SUCCESS, message: t('user.profile.identity.updateSuccess') }));
			},
			onError: (err) => dispatch(pushToast({ type: ToastType.ERROR, error: err })),
		});
	};

	return (
		<form className="update-details-form" onSubmit={handleSubmit(onSubmit)}>
			<FormRow>
				<FormField
					label="user.profile.identity.firstName"
					error={errors.firstName}
					type="text"
					autoComplete="given-name"
					{...register('firstName')}
				/>
				<FormField
					label="user.profile.identity.lastName"
					error={errors.lastName}
					type="text"
					autoComplete="family-name"
					{...register('lastName')}
				/>
			</FormRow>

			<FormField
				label="user.profile.identity.email"
				error={errors.email}
				type="email"
				autoComplete="email"
				{...register('email')}
			/>

			<div className="update-details-form__hint">{t('user.profile.identity.emailHint')}</div>

			<div className="update-details-form__actions">
				<Button type="submit" variant={ButtonVariant.PRIMARY} size={ButtonSize.MD} disabled={isPending}>
					{isPending ? <Spinner /> : t('user.profile.identity.saveButton')}
				</Button>
			</div>
		</form>
	);
}
