import { ChipVariant } from '@/app/shared/models/chip.models';

export const CHIP_VARIANT_CLASS: Record<ChipVariant, string> = {
	[ChipVariant.OK]: 'chip--ok',
	[ChipVariant.WARN]: 'chip--warn',
	[ChipVariant.ERR]: 'chip--err',
	[ChipVariant.BRONZE]: 'chip--bronze',
};
