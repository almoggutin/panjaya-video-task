import { NavLink } from 'react-router-dom';

import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './mobile-menu-nav.component.css';

type MobileMenuNavProps = {
	isAuthenticated: boolean;
	onClose: () => void;
};

export function MobileMenuNav({ isAuthenticated, onClose }: MobileMenuNavProps) {
	const { t } = useTranslation();

	const cls = ({ isActive }: { isActive: boolean }) => `header__mobile-menu-link${isActive ? ' active' : ''}`;

	return (
		<nav className="header__mobile-menu-nav">
			{isAuthenticated ? (
				<>
					<NavLink to="/assets" className={cls} onClick={onClose}>
						{t('shell.header.nav.library')}
					</NavLink>

					<div className="header__mobile-menu-nav-divider" />

					<NavLink to="/changelog" className={cls} onClick={onClose}>
						{t('shell.header.nav.status')}
					</NavLink>
				</>
			) : (
				<>
					<NavLink to="/" end className={cls} onClick={onClose}>
						{t('shell.header.nav.product')}
					</NavLink>

					<NavLink to="/changelog" className={cls} onClick={onClose}>
						{t('shell.header.nav.status')}
					</NavLink>
				</>
			)}
		</nav>
	);
}
