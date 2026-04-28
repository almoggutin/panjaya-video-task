import { createContext, useRef, useEffect, type ReactNode } from 'react';

import { useAudioContext } from '../hooks/audio-context.hook';
import type { IAudioGraph } from '../models/asset.models';

export const AudioGraphContext = createContext<IAudioGraph | null>(null);

export function AudioGraphProvider({ children }: { children: ReactNode }) {
	const getCtx = useAudioContext();
	const graphRef = useRef<IAudioGraph | null>(null);

	if (!graphRef.current) {
		const audioContext: AudioContext = getCtx();
		const gainA: GainNode = audioContext.createGain();
		const gainB: GainNode = audioContext.createGain();
		const masterGain: GainNode = audioContext.createGain();

		gainA.gain.value = 1;
		gainB.gain.value = 0;
		masterGain.gain.value = 0.85;

		gainA.connect(masterGain);
		gainB.connect(masterGain);
		masterGain.connect(audioContext.destination);

		const connected: WeakSet<HTMLAudioElement> = new WeakSet<HTMLAudioElement>();

		const connectSource = (element: HTMLAudioElement, gain: GainNode) => {
			if (connected.has(element)) return;

			connected.add(element);
			const src: MediaElementAudioSourceNode = audioContext.createMediaElementSource(element);
			src.connect(gain);
		};

		const setMasterVolume = (volume: number) => {
			masterGain.gain.value = volume;
		};

		graphRef.current = { audioContext, gainA, gainB, setMasterVolume, connectSource };
	}

	useEffect(() => {
		return () => {
			graphRef.current?.audioContext.close();
			graphRef.current = null;
		};
	}, []);

	return <AudioGraphContext.Provider value={graphRef.current}>{children}</AudioGraphContext.Provider>;
}
