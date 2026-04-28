import { CROSSFADE_SEC } from '../constants/player.constants';

export function useCrossfade() {
	const crossfade = (audioCtx: AudioContext, gainA: GainNode, gainB: GainNode, toModified: boolean) => {
		const now: number = audioCtx.currentTime;
		const targetA: number = toModified ? 0 : 1;
		const targetB: number = toModified ? 1 : 0;

		gainA.gain.cancelScheduledValues(now);
		gainB.gain.cancelScheduledValues(now);

		gainA.gain.setValueAtTime(gainA.gain.value, now);
		gainB.gain.setValueAtTime(gainB.gain.value, now);

		gainA.gain.linearRampToValueAtTime(targetA, now + CROSSFADE_SEC);
		gainB.gain.linearRampToValueAtTime(targetB, now + CROSSFADE_SEC);
	};

	return { crossfade };
}
