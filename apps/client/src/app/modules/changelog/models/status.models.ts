export enum ServiceStatus {
	OPERATIONAL = 'operational',
	DEGRADED = 'degraded',
	OUTAGE = 'outage',
}

export enum ChangelogTag {
	STABLE = 'stable',
	PREVIEW = 'preview',
}

export enum NoteKind {
	FEAT = 'feat',
	FIX = 'fix',
	PERF = 'perf',
	CHORE = 'chore',
	DOCS = 'docs',
	BREAKING = 'breaking',
}

export interface IService {
	name: string;
	status: ServiceStatus;
	latency: number;
	uptime: number;
	note?: string;
}

export interface IChangelogItem {
	kind: NoteKind;
	description: string;
	issue?: number;
}

export interface IChangelogEntry {
	version: string;
	date: string;
	tag: ChangelogTag;
	items: IChangelogItem[];
}
