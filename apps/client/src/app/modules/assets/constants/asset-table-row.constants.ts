import { AssetStatus } from '../models/asset.models';
import { ChipVariant } from '@/app/shared/models/chip.models';

export const PROCESSING_STATES = new Set<AssetStatus>([
	AssetStatus.QUEUED,
	AssetStatus.EXTRACTING,
	AssetStatus.TRANSFORMING,
	AssetStatus.FINALIZING,
]);

export const STATE_CHIP_VARIANT: Record<AssetStatus, ChipVariant> = {
	[AssetStatus.QUEUED]: ChipVariant.WARN,
	[AssetStatus.EXTRACTING]: ChipVariant.BRONZE,
	[AssetStatus.TRANSFORMING]: ChipVariant.BRONZE,
	[AssetStatus.FINALIZING]: ChipVariant.BRONZE,
	[AssetStatus.READY]: ChipVariant.OK,
	[AssetStatus.FAILED]: ChipVariant.ERR,
};
