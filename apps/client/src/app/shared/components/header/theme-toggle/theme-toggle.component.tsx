import MoonIcon from '@svgs/moon.svg?react';
import SunIcon from '@svgs/sun.svg?react';

import { Theme } from '@/app/core/models/theme.models';
import { IconButton } from '@/app/shared/components/icon-button/icon-button.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './theme-toggle.component.css';

type ThemeToggleProps = {
	theme: Theme;
	onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
	const { t } = useTranslation();

	return (
		<IconButton onClick={onToggle} title={t('shell.header.toggleTheme')}>
			{theme === Theme.DARK ? <SunIcon width={15} height={15} /> : <MoonIcon width={15} height={15} />}
		</IconButton>
	);
}
