import { VALID_NOTE_KINDS } from '../constants/status.constants';
import { ChangelogTag, type NoteKind, type IChangelogEntry, type IChangelogItem } from '../models/status.models';

function parseKind(raw: string): NoteKind | null {
	return VALID_NOTE_KINDS.has(raw) ? (raw as NoteKind) : null;
}

export function parseChangelog(raw: string): IChangelogEntry[] {
	if (!raw) return [];
	const entries: IChangelogEntry[] = [];
	const sections: string[] = raw.split(/^## /m).slice(1);

	for (const section of sections) {
		const lines: string[] = section.split('\n');
		const headerMatch: RegExpMatchArray | null = lines[0].trim().match(/^\[([^\]]+)\] - (\d{4}-\d{2}-\d{2})(?:\s+\[(\w+)\])?$/);
		if (!headerMatch) continue;

		const [, version, date, tagRaw] = headerMatch;
		const tag = tagRaw === 'preview' ? ChangelogTag.PREVIEW : ChangelogTag.STABLE;
		const items: IChangelogItem[] = [];

		for (let i = 1; i < lines.length; i++) {
			const line: string = lines[i].trim();
			if (!line.startsWith('- ')) continue;

			const itemMatch: RegExpMatchArray | null = line.match(/^- (\w+): (.+?)(?:\s+\(#(\d+)\))?$/);
			if (!itemMatch) continue;

			const kind: NoteKind | null = parseKind(itemMatch[1]);
			if (!kind) continue;

			items.push({
				kind,
				description: itemMatch[2],
				issue: itemMatch[3] ? parseInt(itemMatch[3], 10) : undefined,
			});
		}

		if (items.length > 0) 
			entries.push({ version, date, tag, items });
		
	}

	return entries;
}
