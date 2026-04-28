import ChangelogIcon from '@svgs/changelog.svg?react';

import './changelog-empty.component.css';

export function ChangelogEmpty() {
	return (
		<div className="changelog-empty">
			<ChangelogIcon className="changelog-empty__icon" width={40} height={40} />
			<span className="changelog-empty__title">No versions yet</span>
			<span className="changelog-empty__subtitle">Releases will appear here once the changelog is populated.</span>
		</div>
	);
}
