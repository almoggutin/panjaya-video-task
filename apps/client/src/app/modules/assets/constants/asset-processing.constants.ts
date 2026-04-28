import { AssetStatus } from '../models/asset.models';

export const PROCESSING_STEPS = [
	AssetStatus.QUEUED,
	AssetStatus.EXTRACTING,
	AssetStatus.TRANSFORMING,
	AssetStatus.FINALIZING,
	AssetStatus.READY,
] as const;

export type ProcessingStep = (typeof PROCESSING_STEPS)[number];
