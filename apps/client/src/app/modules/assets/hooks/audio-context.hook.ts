import { useRef } from 'react';

let sharedContext: AudioContext | null = null;

export function useAudioContext(): () => AudioContext {
	const getRef = useRef<() => AudioContext>(() => {
		if (!sharedContext || sharedContext.state === 'closed') {
			sharedContext = new AudioContext();
		}

		return sharedContext;
	});

	return getRef.current;
}
