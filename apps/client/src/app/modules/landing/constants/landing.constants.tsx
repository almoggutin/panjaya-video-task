import { ReactNode } from 'react';

import WaveformIcon from '@svgs/waveform.svg?react';
import UploadIcon from '@svgs/upload.svg?react';
import ServerIcon from '@svgs/server.svg?react';

type Feature = {
	icon: ReactNode;
	titleKey: 'landing.features.compare.title' | 'landing.features.hub.title' | 'landing.features.pipeline.title';
	bodyKey: 'landing.features.compare.body' | 'landing.features.hub.body' | 'landing.features.pipeline.body';
	tagKey: 'landing.features.compare.tag' | 'landing.features.hub.tag' | 'landing.features.pipeline.tag';
};

export const LANDING_FEATURES: Feature[] = [
	{
		icon: <WaveformIcon width={20} height={20} />,
		titleKey: 'landing.features.compare.title',
		bodyKey: 'landing.features.compare.body',
		tagKey: 'landing.features.compare.tag',
	},
	{
		icon: <UploadIcon width={20} height={20} />,
		titleKey: 'landing.features.hub.title',
		bodyKey: 'landing.features.hub.body',
		tagKey: 'landing.features.hub.tag',
	},
	{
		icon: <ServerIcon width={20} height={20} />,
		titleKey: 'landing.features.pipeline.title',
		bodyKey: 'landing.features.pipeline.body',
		tagKey: 'landing.features.pipeline.tag',
	},
];
