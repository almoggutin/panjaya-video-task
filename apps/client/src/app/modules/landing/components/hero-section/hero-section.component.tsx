import ArrowIcon from '@svgs/arrow.svg?react';

import { Button } from '@/app/shared/components/button/button.component';
import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './hero-section.component.css';

type HeroSectionProps = {
	onCta: () => void;
};

export function HeroSection({ onCta }: HeroSectionProps) {
	const { t } = useTranslation();

	return (
		<section className="hero-section">
			<div className="hero-section__hex-bg" />

			<div className="container hero-section__inner">
				<h1 className="hero-section__headline">
					{t('landing.hero.headline')}
					<br />
					<span className="hero-section__headline-accent">{t('landing.hero.headlineAccent')}</span>
				</h1>

				<p className="hero-section__description">{t('landing.hero.description')}</p>

				<Button variant={ButtonVariant.PRIMARY} size={ButtonSize.LG} onClick={onCta}>
					{t('landing.hero.cta')} <ArrowIcon width={14} height={14} />
				</Button>
			</div>
		</section>
	);
}
