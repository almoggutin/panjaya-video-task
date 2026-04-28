import { useNavigate } from 'react-router-dom';

import { Button } from '@/app/shared/components/button/button.component';
import { ButtonVariant } from '@/app/shared/models/button.models';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './not-found.component.css';

export function NotFound() {
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<div className="not-found">
			<span className="not-found__code">404</span>

			<h1 className="not-found__title">{t('shell.notFound.title')}</h1>
			<p className="not-found__description">{t('shell.notFound.description')}</p>

			<div className="not-found__actions">
				<Button variant={ButtonVariant.PRIMARY} onClick={() => navigate('/')}>
					{t('common.buttons.home')}
				</Button>
			</div>
		</div>
	);
}
