import { ChangelogTag, type IChangelogEntry } from '../../models/status.models';
import { ChangelogNote } from '../changelog-note/changelog-note.component';

import './changelog-entry.component.css';

type ChangelogEntryProps = {
	entry: IChangelogEntry;
};

export function ChangelogEntry({ entry }: ChangelogEntryProps) {
	return (
		<div className="changelog-entry">
			<div
				className="changelog-entry__dot"
				style={{ background: entry.tag === ChangelogTag.PREVIEW ? 'var(--bronze)' : 'var(--sand)' }}
			/>

			<div className="changelog-entry__header">
				<span className="changelog-entry__version">v{entry.version}</span>
			</div>

			<div className="changelog-entry__panel">
				{entry.items.map((item, j) => (
					<ChangelogNote key={j} item={item} bordered={j < entry.items.length - 1} />
				))}
			</div>
		</div>
	);
}
