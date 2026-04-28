import WaveformIcon from '@svgs/waveform.svg?react';

import { ActiveTrack } from '../../../models/asset.models';

import './track-switch.component.css';

type TrackSwitchProps = {
	activeTrack: ActiveTrack;
	onChange: (track: ActiveTrack) => void;
};

export function TrackSwitch({ activeTrack, onChange }: TrackSwitchProps) {
	return (
		<div className="track-switch">
			<button
				type="button"
				className="track-switch__btn"
				data-active={activeTrack === ActiveTrack.ORIGINAL}
				data-variant="original"
				onClick={() => onChange(ActiveTrack.ORIGINAL)}
			>
				<WaveformIcon width={12} height={12} />
				Original
			</button>

			<button
				type="button"
				className="track-switch__btn"
				data-active={activeTrack === ActiveTrack.MODIFIED}
				data-variant="modified"
				onClick={() => onChange(ActiveTrack.MODIFIED)}
			>
				<WaveformIcon width={12} height={12} />
				Modified
			</button>
		</div>
	);
}
