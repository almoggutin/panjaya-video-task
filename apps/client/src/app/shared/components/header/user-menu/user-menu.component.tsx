import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';

import ChevronDownIcon from '@svgs/chevron-down.svg?react';
import GridIcon from '@svgs/grid.svg?react';
import LogoutIcon from '@svgs/logout.svg?react';
import UserIcon from '@svgs/user.svg?react';

import type { IUser } from '@/app/modules/user/models/user.models';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './user-menu.component.css';

type UserMenuProps = {
	user?: IUser;
	onLogout: () => void;
};

export function UserMenu({ user, onLogout }: UserMenuProps) {
	const { t } = useTranslation();
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	const initials: string | undefined = user?.initials ?? '';

	useEffect(() => {
		if (!open) return;

		const handler = (e: MouseEvent): void => {
			if (menuRef.current?.contains(e.target as Node)) return;
			setOpen(false);
		};

		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [open]);

	return (
		<div className="user-menu" ref={menuRef}>
			<button
				className="user-menu__trigger"
				onClick={() => setOpen((v) => !v)}
				aria-label="User menu"
				aria-expanded={open}
				disabled={!user}
			>
				<div
					className={`user-menu__avatar user-menu__avatar--sm${!user ? ' user-menu__avatar--skeleton' : ''}`}
				>
					{initials}
				</div>
				<ChevronDownIcon width={12} height={12} className="user-menu__chevron" />
			</button>

			{open && user && (
				<div className="user-menu__dropdown">
					<div className="user-menu__header">
						<div className="user-menu__avatar user-menu__avatar--lg">{initials}</div>
						<div className="user-menu__info">
							<span className="user-menu__name">{user.fullName}</span>
							<span className="user-menu__email">{user.email}</span>
						</div>
					</div>

					<div className="user-menu__divider" />

					<NavLink to="/profile" className="user-menu__item" onClick={() => setOpen(false)}>
						<UserIcon width={14} height={14} className="user-menu__item-icon" />
						{t('user.profile.title')}
					</NavLink>

					<NavLink to="/assets" className="user-menu__item" onClick={() => setOpen(false)}>
						<GridIcon width={14} height={14} className="user-menu__item-icon" />
						{t('shell.header.nav.library')}
					</NavLink>

					<div className="user-menu__divider" />

					<button className="user-menu__item user-menu__item--logout" onClick={onLogout}>
						<LogoutIcon width={14} height={14} className="user-menu__item-icon" />
						{t('common.buttons.logout')}
					</button>
				</div>
			)}
		</div>
	);
}
