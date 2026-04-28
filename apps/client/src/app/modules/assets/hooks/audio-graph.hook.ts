import { useContext } from 'react';

import { AudioGraphContext } from '../contexts/audio-graph.context';
import type { IAudioGraph } from '../models/asset.models';

export function useAudioGraph(): IAudioGraph {
	const context = useContext(AudioGraphContext);
	if (!context) throw new Error('useAudioGraph must be used within AudioGraphProvider');

	return context;
}
