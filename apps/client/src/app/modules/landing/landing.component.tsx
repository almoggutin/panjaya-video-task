import { useNavigate } from 'react-router-dom';

import { FeaturesSection } from './components/features-section/features-section.component';
import { HeroSection } from './components/hero-section/hero-section.component';
import { PreviewSection } from './components/preview-section/preview-section.component';
import './landing.component.css';

export function Landing() {
	const navigate = useNavigate();

	return (
		<div className="landing">
			<HeroSection onCta={() => navigate('/auth')} />
			<PreviewSection />
			<FeaturesSection />
		</div>
	);
}
