import { useNavigate } from 'react-router-dom';

import type { Theme } from '@/app/core/models/theme.models';

import { GithubLink } from '../github-link/github-link.component';
import { ThemeToggle } from '../theme-toggle/theme-toggle.component';
import { MobileMenuActions } from './mobile-menu-actions/mobile-menu-actions.component';
import { MobileMenuNav } from './mobile-menu-nav/mobile-menu-nav.component';

import './mobile-menu.component.css';

type MobileMenuProps = {
	theme: Theme;
	onToggleTheme: () => void;
	onClose: () => void;
	isAuthenticated: boolean;
	onLogout: () => void;
};

export function MobileMenu({ theme, onToggleTheme, onClose, isAuthenticated, onLogout }: MobileMenuProps) {
	const navigate = useNavigate();
	const navTo = (path: string) => { navigate(path); onClose(); };

	return (
		<>
			<div className="header__mobile-backdrop" onClick={onClose} />
			<div className="header__mobile-menu">
				<MobileMenuNav isAuthenticated={isAuthenticated} onClose={onClose} />
				<MobileMenuActions
					isAuthenticated={isAuthenticated}
					onNavigate={navTo}
					onLogout={() => { onLogout(); onClose(); }}
				/>
				<div className="header__mobile-menu-divider" />
				<div className="header__mobile-menu-footer">
					<ThemeToggle theme={theme} onToggle={onToggleTheme} />
					<GithubLink />
				</div>
			</div>
		</>
	);
}
