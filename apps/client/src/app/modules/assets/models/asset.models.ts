import type { PLAYBACK_RATES } from '../constants/player.constants';

export type PlaybackRate = (typeof PLAYBACK_RATES)[number];

export interface IAudioGraph {
	audioContext: AudioContext;
	gainA: GainNode;
	gainB: GainNode;
	setMasterVolume: (v: number) => void;
	connectSource: (el: HTMLAudioElement, gain: GainNode) => void;
}

export enum WaveformVariant {
	ORIGINAL = 'original',
	MODIFIED = 'modified',
}

export enum ActiveTrack {
	ORIGINAL = 'original',
	MODIFIED = 'modified',
}

export enum AssetStatus {
	QUEUED = 'queued',
	EXTRACTING = 'extracting',
	TRANSFORMING = 'transforming',
	FINALIZING = 'finalizing',
	READY = 'ready',
	FAILED = 'failed',
}

export interface IAsset {
	id: string;
	title: string;
	description: string | null;
	originalFilename: string;
	format: string;
	sizeBytes: number | null;
	durationSec: number | null;
	status: AssetStatus;
	videoUrl: string | null;
	audioUrl: string | null;
	modifiedAudioUrl: string | null;
	modifiedVideoUrl: string | null;
	peaksUrl: string | null;
	thumbnailUrl: string | null;
	errorMessage: string | null;
	createdAt: string;
	updatedAt: string;
	progress?: number;
}

export interface IListAssetsParams {
	page: number;
	limit?: number;
	sortKey: string;
	sortDir: string;
	search?: string;
}

export interface IListAssetsResponse {
	items: IAsset[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface IPresignedUploadResponse {
	assetId: string;
	uploadUrl: string;
}

export interface IUploadAssetVariables {
	file: File;
	title: string;
	description?: string;
}
