import { z } from 'zod';

import { AssetStatus } from '../models/asset.models';

export const StatusEventDataSchema = z
	.object({
		asset_id: z.string(),
		state: z.nativeEnum(AssetStatus),
		progress: z.number(),
		message: z.string().optional(),
	})
	.transform((d) => ({ assetId: d.asset_id, state: d.state, progress: d.progress, message: d.message }));

export const ReadyEventDataSchema = z
	.object({
		asset_id: z.string(),
		audio_url: z.string(),
		modified_audio_url: z.string(),
		modified_video_url: z.string().optional(),
		peaks_url: z.string(),
		thumbnail_url: z.string(),
		duration_sec: z.number(),
	})
	.transform((d) => ({
		assetId: d.asset_id,
		audioUrl: d.audio_url,
		modifiedAudioUrl: d.modified_audio_url,
		modifiedVideoUrl: d.modified_video_url ?? null,
		peaksUrl: d.peaks_url,
		thumbnailUrl: d.thumbnail_url,
		durationSec: d.duration_sec,
	}));

export const ErrorEventDataSchema = z
	.object({
		asset_id: z.string(),
		code: z.string(),
		message: z.string(),
	})
	.transform((d) => ({ assetId: d.asset_id, code: d.code, message: d.message }));
