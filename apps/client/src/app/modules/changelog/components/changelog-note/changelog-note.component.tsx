import { NOTE_KIND_STYLE } from '../../constants/status.constants';
import { type IChangelogItem } from '../../models/status.models';

import './changelog-note.component.css';

type ChangelogNoteProps = {
	item: IChangelogItem;
	bordered: boolean;
};

export function ChangelogNote({ item, bordered }: ChangelogNoteProps) {
	return (
		<div className={`changelog-note${bordered ? ' changelog-note--bordered' : ''}`}>
			<span className="changelog-note__kind" style={NOTE_KIND_STYLE[item.kind]}>
				{item.kind}
			</span>
			<span className="changelog-note__text">{item.description}</span>
			{item.issue && <span className="changelog-note__issue">#{item.issue}</span>}
		</div>
	);
}
