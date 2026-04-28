import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';

import ArrowIcon from '@svgs/arrow.svg?react';

import { useSignupMutation } from '../../hooks/use-signup-mutation.hook';
import { SignupSchema, type SignupForm } from '../../schemas/signup.schema';

import { loggedIn } from '@/app/core/slices/auth.slice';
import { pushToast } from '@/app/core/slices/ui.slice';
import { useAppDispatch } from '@/app/core/store/hooks';
import { ToastType } from '@/app/core/models/theme.models';
import { Button } from '@/app/shared/components/button/button.component';
import { FormField } from '@/app/shared/components/form-field/form-field.component';
import { FormRow } from '@/app/shared/components/form-row/form-row.component';
import { PasswordField } from '@/app/shared/components/password-field/password-field.component';
import { PasswordStrength } from '@/app/shared/components/password-strength/password-strength.component';
import { Spinner } from '@/app/shared/components/spinner/spinner.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';

import './signup.component.css';

export function Signup() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const { mutate: signup, isPending } = useSignupMutation();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<SignupForm>({
		resolver: zodResolver(SignupSchema),
	});

	const password = watch('password', '');

	const onSubmit = (data: SignupForm) => {
		signup(data, {
			onSuccess: (data) => {
				dispatch(loggedIn({ accessToken: data.accessToken, refreshToken: data.refreshToken }));
				navigate('/assets');
			},
			onError: (err) => dispatch(pushToast({ type: ToastType.ERROR, error: err })),
		});
	};

	return (
		<>
			<form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
				<FormRow>
					<FormField
						label="auth.signup.firstName"
						error={errors.firstName}
						placeholder="Ada"
						autoFocus
						{...register('firstName')}
					/>
					<FormField
						label="auth.signup.lastName"
						error={errors.lastName}
						placeholder="Okafor"
						{...register('lastName')}
					/>
				</FormRow>

				<FormField
					label="auth.signup.email"
					error={errors.email}
					type="email"
					placeholder="you@company.com"
					{...register('email')}
				/>

				<PasswordField
					label="auth.signup.password"
					error={errors.password}
					placeholder="at least 8 characters"
					hint={<PasswordStrength password={password} />}
					{...register('password')}
				/>

				<PasswordField label="auth.signup.confirmPassword" error={errors.confirm} {...register('confirm')} />

				<Button
					type="submit"
					variant={ButtonVariant.PRIMARY}
					size={ButtonSize.LG}
					fullWidth
					disabled={isPending}
				>
					{isPending ? (
						<Spinner />
					) : (
						<>
							<span>{t('auth.signup.submit')}</span> <ArrowIcon width={14} height={14} />
						</>
					)}
				</Button>
			</form>

			<div className="auth-card__footer">
				{t('auth.signup.hasAccount')}{' '}
				<NavLink className="auth-link" to="/auth/login">
					{t('auth.signup.signIn')}
				</NavLink>
			</div>
		</>
	);
}
