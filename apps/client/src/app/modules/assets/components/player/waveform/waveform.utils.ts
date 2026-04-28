import { WaveformVariant } from '../../../models/asset.models';

export function hashId(id: string): number {
	let seed = 0;
	for (let i = 0; i < id.length; i++) seed = (seed * 31 + id.charCodeAt(i)) & 0xffff;
	return seed;
}

export function seedFor(id: string, variant: WaveformVariant): number {
	const seed: number = hashId(id);
	return variant === WaveformVariant.MODIFIED ? seed ^ 0x5a5a : seed;
}

export function advanceSeed(seed: number): number {
	return (seed * 9301 + 49297) & 0xffff;
}

export function envelopeAt(i: number, count: number): number {
	return Math.min(1, i / (count * 0.05)) * Math.min(1, (count - i) / (count * 0.08));
}

export function smoothAt(base: number, i: number, variant: WaveformVariant): number {
	return variant === WaveformVariant.MODIFIED ? 0.55 + base * 0.38 + Math.sin(i * 0.09) * 0.05 : 0.25 + base * 0.7;
}

export function peaksFor(
	id: string,
	count: number = 260,
	variant: WaveformVariant = WaveformVariant.ORIGINAL
): number[] {
	let seed: number = seedFor(id, variant);
	return Array.from({ length: count }, (_, i) => {
		seed = advanceSeed(seed);
		const base: number = seed / 0xffff;
		const peak: number = smoothAt(base, i, variant) * envelopeAt(i, count);
		return Math.max(0.04, peak);
	});
}
