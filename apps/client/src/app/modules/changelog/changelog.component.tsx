import { ChangelogSection } from './components/changelog-section/changelog-section.component';
import { CHANGELOG } from './constants/status.constants';

import './changelog.component.css';

export function Changelog() {
	return (
		<div className="changelog-page">
			<div className="container">
				<div className="changelog-page__intro">
					<h1 className="changelog-page__title">Changelog</h1>
					<p className="changelog-page__subtitle">Every shipped version, in one place.</p>
				</div>

				<ChangelogSection entries={CHANGELOG} />
			</div>
		</div>
	);
}
