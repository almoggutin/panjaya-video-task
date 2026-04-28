import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import { LANDING_FEATURES } from '../../constants/landing.constants';
import './features-section.component.css';

export function FeaturesSection() {
	const { t } = useTranslation();

	return (
		<section className="features-section">
			<div className="container">
				<div className="features-section__grid">
					{LANDING_FEATURES.map((f, i) => (
						<div key={i} className="features-section__feature">
							<div className="features-section__icon">{f.icon}</div>

							<h3 className="features-section__title">{t(f.titleKey)}</h3>
							<p className="features-section__body">{t(f.bodyKey)}</p>

							<div className="features-section__tag">
								<span className="features-section__tag-line" />
								{t(f.tagKey)}
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
