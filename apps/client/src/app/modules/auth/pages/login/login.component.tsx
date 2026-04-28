import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import ArrowIcon from '@svgs/arrow.svg?react';

import { useLoginMutation } from '../../hooks/use-login-mutation.hook';
import { LoginSchema, type LoginForm } from '../../schemas/login.schema';

import { loggedIn } from '@/app/core/slices/auth.slice';
import { pushToast } from '@/app/core/slices/ui.slice';
import { useAppDispatch } from '@/app/core/store/hooks';
import { ToastType } from '@/app/core/models/theme.models';
import { Button } from '@/app/shared/components/button/button.component';
import { FormField } from '@/app/shared/components/form-field/form-field.component';
import { PasswordField } from '@/app/shared/components/password-field/password-field.component';
import { Spinner } from '@/app/shared/components/spinner/spinner.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';

import './login.component.css';

export function Login() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();

	const { mutate: login, isPending } = useLoginMutation();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginForm>({
		resolver: zodResolver(LoginSchema),
	});

	const onSubmit = (data: LoginForm) => {
		login(data, {
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
				<FormField
					label="auth.login.email"
					error={errors.email}
					type="email"
					placeholder="you@company.com"
					autoFocus
					{...register('email')}
				/>

				<PasswordField
					label="auth.login.password"
					error={errors.password}
					placeholder="••••••••"
					{...register('password')}
				/>

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
							{t('auth.login.submit')} <ArrowIcon width={14} height={14} />
						</>
					)}
				</Button>
			</form>

			<div className="auth-card__footer">
				<span>{t('auth.login.noAccount')}</span>{' '}
				<NavLink className="auth-link" to="/auth/signup">
					{t('auth.login.createOne')}
				</NavLink>
			</div>
		</>
	);
}
