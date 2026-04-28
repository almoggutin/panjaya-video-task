import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { GithubLink } from './github-link/github-link.component';
import { HamburgerButton } from './hamburger-button/hamburger-button.component';
import { MobileMenu } from './mobile-menu/mobile-menu.component';
import { ThemeToggle } from './theme-toggle/theme-toggle.component';
import { UserMenu } from './user-menu/user-menu.component';

import { loggedOut } from '@/app/core/slices/auth.slice';
import { store } from '@/app/core/store/store';
import { logout } from '@/app/modules/auth/services/auth.service';
import { setBlockingLoader, toggleTheme } from '@/app/core/slices/ui.slice';
import { useAppDispatch, useAppSelector } from '@/app/core/store/hooks';
import { useCurrentUser } from '@/app/modules/user/hooks/current-user.hook';
import { Button } from '@/app/shared/components/button/button.component';
import { useDevice } from '@/app/core/hooks/use-device.hook';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';

import './header.component.css';

export function Header() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const theme = useAppSelector((state) => state.ui.theme);
	const isAuthenticated: boolean = useAppSelector((state) => state.auth.isAuthenticated);
	const currentUser = useAppSelector((state) => state.auth.user ?? undefined);
	const [menuOpen, setMenuOpen] = useState(false);
	const location = useLocation();
	const { t } = useTranslation();
	const { isMobile } = useDevice();
	useCurrentUser();

	useEffect(() => {
		setMenuOpen(false);
	}, [location.pathname, isMobile]);

	useEffect(() => {
		if (!menuOpen) return;

		const onKey = (e: KeyboardEvent): void => {
			if (e.key !== 'Escape') return;
			setMenuOpen(false);
		};

		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [menuOpen]);

	const handleToggleTheme = () => dispatch(toggleTheme());

	const handleLogout = async () => {
		dispatch(setBlockingLoader(true));

		const refreshToken: string | null = store.getState().auth.refreshToken;
		if (refreshToken) await logout(refreshToken);

		dispatch(loggedOut());
		dispatch(setBlockingLoader(false));
		queryClient.clear();

		navigate('/auth/login', { replace: true });
	};

	const navLinkClass = ({ isActive }: { isActive: boolean }) => `header__nav-link${isActive ? ' active' : ''}`;

	return (
		<header className="header">
			<Link to="/" className="header__brand">
				<img src="/favicon.ico" alt="Panjaya" className="header__brand-img" />

				<span className="header__brand-name">
					panjaya<span className="header__brand-dot">.video</span>
				</span>
			</Link>

			{!isMobile && (
				<nav className="header__nav">
					{isAuthenticated ? (
						<>
							<NavLink to="/assets" className={navLinkClass}>
								{t('shell.header.nav.library')}
							</NavLink>
							<NavLink to="/changelog" className={navLinkClass}>
								{t('shell.header.nav.status')}
							</NavLink>
						</>
					) : (
						<>
							<NavLink to="/" end className={navLinkClass}>
								{t('shell.header.nav.product')}
							</NavLink>
							<NavLink to="/changelog" className={navLinkClass}>
								{t('shell.header.nav.status')}
							</NavLink>
						</>
					)}
				</nav>
			)}

			<div className="header__spacer" />

			{!isMobile && (
				<div className="header__actions">
					<ThemeToggle theme={theme} onToggle={handleToggleTheme} />
					<GithubLink />

					{isAuthenticated ? (
						<UserMenu user={currentUser} onLogout={handleLogout} />
					) : (
						<Button variant={ButtonVariant.PRIMARY} size={ButtonSize.SM} onClick={() => navigate('/auth')}>
							{t('shell.header.signInUp')}
						</Button>
					)}
				</div>
			)}

			{isMobile && <HamburgerButton isOpen={menuOpen} onToggle={() => setMenuOpen((prev) => !prev)} />}

			{menuOpen && (
				<MobileMenu
					theme={theme}
					onToggleTheme={handleToggleTheme}
					onClose={() => setMenuOpen(false)}
					isAuthenticated={isAuthenticated}
					onLogout={handleLogout}
				/>
			)}
		</header>
	);
}
