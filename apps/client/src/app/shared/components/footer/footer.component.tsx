import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import { Version } from '@/app/core/utils/version.utils';

import './footer.component.css';

export function Footer() {
	const { t } = useTranslation();

	return (
		<footer className="footer">
			<span className="footer__version">v{Version.current}</span>

			<div className="footer__spacer" />

			<span>{t('shell.footer.copyright', { year: new Date().getFullYear() })}</span>
		</footer>
	);
}
