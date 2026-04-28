import LogoutIcon from '@svgs/logout.svg?react';
import UserIcon from '@svgs/user.svg?react';

import { Button } from '@/app/shared/components/button/button.component';
import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './mobile-menu-actions.component.css';

type MobileMenuActionsProps = {
	isAuthenticated: boolean;
	onNavigate: (path: string) => void;
	onLogout: () => void;
};

export function MobileMenuActions({ isAuthenticated, onNavigate, onLogout }: MobileMenuActionsProps) {
	const { t } = useTranslation();

	if (!isAuthenticated) {
		return (
			<div className="header__mobile-menu-cta">
				<Button
					variant={ButtonVariant.PRIMARY}
					size={ButtonSize.LG}
					fullWidth
					onClick={() => onNavigate('/auth')}
				>
					{t('shell.header.signInUp')}
				</Button>
			</div>
		);
	}

	return (
		<>
			<div className="header__mobile-menu-divider" />

			<div className="header__mobile-menu-actions">
				<button className="header__mobile-menu-action" onClick={() => onNavigate('/profile')}>
					<UserIcon width={14} height={14} />
					{t('user.profile.title')}
				</button>

				<button className="header__mobile-menu-action header__mobile-menu-action--logout" onClick={onLogout}>
					<LogoutIcon width={14} height={14} />
					{t('common.buttons.logout')}
				</button>
			</div>
		</>
	);
}
