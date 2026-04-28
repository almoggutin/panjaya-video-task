import type { AssetStatus } from './asset.models';

export interface IStatusEventData {
	assetId: string;
	state: AssetStatus;
	progress: number;
	message?: string;
}

export interface IReadyEventData {
	assetId: string;
	audioUrl: string;
	modifiedAudioUrl: string;
	modifiedVideoUrl: string | null;
	peaksUrl: string;
	thumbnailUrl: string;
	durationSec: number;
}

export interface IErrorEventData {
	assetId: string;
	code: string;
	message: string;
}

export type IUserAssetEvent =
	| { type: 'status'; data: IStatusEventData }
	| { type: 'ready'; data: IReadyEventData }
	| { type: 'error'; data: IErrorEventData };

export type UserAssetEventCallback = (event: IUserAssetEvent) => void;
