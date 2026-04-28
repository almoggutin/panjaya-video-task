import { ChangePasswordForm } from './change-password-form/change-password-form.component';
import { DeleteAccount } from './delete-account/delete-account.component';
import { UpdateDetailsForm } from './update-details-form/update-details-form.component';
import { useCurrentUser } from '../../hooks/current-user.hook';

import { Loader } from '@/app/shared/components/loader/loader.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './profile.component.css';

export function Profile() {
	const { t } = useTranslation();
	const { data: user, isLoading } = useCurrentUser();

	if (isLoading) return <Loader />;
	if (!user) return null;

	return (
		<div className="page">
			<div className="container profile__container">
				<h2 className="profile__heading">{t('user.profile.title')}</h2>

				<div className="profile__grid">
					<div className="profile__main">
						<div className="panel">
							<div className="panel-hd">Identity</div>
							<div className="profile__panel-body">
								<UpdateDetailsForm user={user} />
							</div>
						</div>

						<div className="panel">
							<div className="panel-hd">Password</div>
							<div className="profile__panel-body">
								<ChangePasswordForm />
							</div>
						</div>
					</div>

					<div className="profile__aside">
						<DeleteAccount email={user.email} />
					</div>
				</div>
			</div>
		</div>
	);
}
