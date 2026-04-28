import type { ReactNode } from 'react';

import type { TranslationKey } from '@/app/core/models/localization.models';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './auth-card.component.css';

type AuthCardProps = {
	title?: TranslationKey;
	subtitle?: TranslationKey;
	children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
	const { t } = useTranslation();

	return (
		<div className="auth-card">
			<div className="auth-card__hex-bg" />

			<div className="auth-card__inner">
				<div className="auth-card__header">
					<div className="auth-card__brand">
						<img src="/favicon.ico" alt="Panjaya" className="auth-card__brand-img" />
					</div>

					<div className="auth-card__header-text">
						{title && <h1 className="auth-card__title">{t(title)}</h1>}
						{subtitle && <p className="auth-card__subtitle">{t(subtitle)}</p>}
					</div>
				</div>

				<div className="auth-card__panel">{children}</div>
			</div>
		</div>
	);
}
