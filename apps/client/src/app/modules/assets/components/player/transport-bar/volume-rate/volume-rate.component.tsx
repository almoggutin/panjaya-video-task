import VolumeIcon from '@svgs/volume.svg?react';

import type { PlaybackRate } from '../../../../models/asset.models';
import { RateSelect } from './rate-select/rate-select.component';

import './volume-rate.component.css';

type VolumeRateProps = {
	volume: number;
	playbackRate: PlaybackRate;
	onVolumeChange: (volume: number) => void;
	onRateChange: (rate: PlaybackRate) => void;
};

export function VolumeRate({ volume, playbackRate, onVolumeChange, onRateChange }: VolumeRateProps) {
	return (
		<div className="volume-rate">
			<div className="volume-rate__volume">
				<VolumeIcon width={14} height={14} className="volume-rate__volume-icon" />

				<input
					type="range"
					min={0}
					max={1}
					step={0.01}
					value={volume}
					onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
					className="volume-rate__volume-slider"
				/>
			</div>

			<RateSelect value={playbackRate} onChange={onRateChange} />
		</div>
	);
}
