import { type IChangelogEntry } from '../../models/status.models';
import { ChangelogEmpty } from '../changelog-empty/changelog-empty.component';
import { ChangelogEntry } from '../changelog-entry/changelog-entry.component';

import './changelog-section.component.css';

type ChangelogSectionProps = {
	entries: IChangelogEntry[];
};

export function ChangelogSection({ entries }: ChangelogSectionProps) {	
	return (
		<div className="changelog">
			{entries.length === 0 ? (
				<ChangelogEmpty />
			) : (
				<div className="changelog__timeline">
					{entries.map((entry) => (
						<ChangelogEntry key={entry.version} entry={entry} />
					))}
				</div>
			)}
		</div>
	);
}
