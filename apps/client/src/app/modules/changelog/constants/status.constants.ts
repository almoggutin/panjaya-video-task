import { type IChangelogEntry, NoteKind } from '../models/status.models';
import { parseChangelog } from '../utils/changelog-parser';

export const VALID_NOTE_KINDS: Set<string> = new Set<string>(Object.values(NoteKind));

export const CHANGELOG: IChangelogEntry[] = parseChangelog(__CHANGELOG__);

export const NOTE_KIND_STYLE: Record<NoteKind, { background: string; color: string }> = {
	[NoteKind.FEAT]: { background: 'color-mix(in oklch, var(--ok), transparent 85%)', color: 'var(--ok)' },
	[NoteKind.FIX]: { background: 'color-mix(in oklch, var(--bronze), transparent 85%)', color: 'var(--bronze)' },
	[NoteKind.PERF]: { background: 'var(--ink)', color: 'var(--fg-dim)' },
	[NoteKind.CHORE]: { background: 'var(--ink)', color: 'var(--fg-dim)' },
	[NoteKind.DOCS]: { background: 'var(--ink)', color: 'var(--fg-dim)' },
	[NoteKind.BREAKING]: { background: 'color-mix(in oklch, var(--danger), transparent 85%)', color: 'var(--danger)' },
};
