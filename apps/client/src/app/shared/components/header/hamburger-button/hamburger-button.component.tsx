import MenuIcon from '@svgs/menu.svg?react';
import XIcon from '@svgs/x.svg?react';

import { IconButton } from '@/app/shared/components/icon-button/icon-button.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './hamburger-button.component.css';

type HamburgerButtonProps = {
	isOpen: boolean;
	onToggle: () => void;
};

export function HamburgerButton({ isOpen, onToggle }: HamburgerButtonProps) {
	const { t } = useTranslation();

	return (
		<IconButton
			onClick={onToggle}
			title={isOpen ? t('shell.header.closeMenu') : t('shell.header.openMenu')}
			aria-expanded={isOpen}
		>
			{isOpen ? <XIcon width={16} height={16} /> : <MenuIcon width={16} height={16} />}
		</IconButton>
	);
}
