import { PlaybackBtns } from './playback-btns/playback-btns.component';
import { VolumeRate } from './volume-rate/volume-rate.component';
import { TrackSwitch } from '../track-switch/track-switch.component';
import type { ActiveTrack, PlaybackRate } from '../../../models/asset.models';
import { Utils } from '@/app/core/utils/common.utils';
import { useDevice } from '@/app/core/hooks/use-device.hook';

import './transport-bar.component.css';

type TransportBarProps = {
	playing: boolean;
	currentTimeRef: React.RefObject<HTMLSpanElement | null>;
	seekFillRef: React.RefObject<HTMLDivElement | null>;
	seekThumbRef: React.RefObject<HTMLDivElement | null>;
	duration: number;
	volume: number;
	playbackRate: PlaybackRate;
	activeTrack: ActiveTrack;
	onPlayPause: () => void;
	onSeek: (absoluteTime: number) => void;
	onSkip: (deltaSeconds: number) => void;
	onVolumeChange: (v: number) => void;
	onRateChange: (r: PlaybackRate) => void;
	onTrackChange: (track: ActiveTrack) => void;
};

export function TransportBar({
	playing,
	currentTimeRef,
	seekFillRef,
	seekThumbRef,
	duration,
	volume,
	playbackRate,
	activeTrack,
	onPlayPause,
	onSeek,
	onSkip,
	onVolumeChange,
	onRateChange,
	onTrackChange,
}: TransportBarProps) {
	const { isMobile } = useDevice();

	const handleSeekClick = (event: React.MouseEvent<HTMLDivElement>) => {
		const r = event.currentTarget.getBoundingClientRect();
		onSeek(((event.clientX - r.left) / r.width) * duration);
	};

	return (
		<div className="transport-bar">
			<div className="transport-bar__seek-row">
				<span className="transport-bar__time mono" ref={currentTimeRef}>
					0:00
				</span>

				<div className="transport-bar__seekbar" onClick={handleSeekClick}>
					<div className="transport-bar__seekbar-fill" ref={seekFillRef} />
					<div className="transport-bar__seekbar-thumb" ref={seekThumbRef} />
				</div>

				<span className="transport-bar__time transport-bar__time--right mono">
					{Utils.formatDuration(duration)}
				</span>
			</div>

			{isMobile ? (
				<>
					<div className="transport-bar__row transport-bar__row--centered">
						<PlaybackBtns playing={playing} onPlayPause={onPlayPause} onSkip={onSkip} />
					</div>

					<div className="transport-bar__row transport-bar__row--centered">
						<TrackSwitch activeTrack={activeTrack} onChange={onTrackChange} />
					</div>

					<div className="transport-bar__row transport-bar__row--centered">
						<VolumeRate
							volume={volume}
							playbackRate={playbackRate}
							onVolumeChange={onVolumeChange}
							onRateChange={onRateChange}
						/>
					</div>
				</>
			) : (
				<div className="transport-bar__row">
					<PlaybackBtns playing={playing} onPlayPause={onPlayPause} onSkip={onSkip} />
					<TrackSwitch activeTrack={activeTrack} onChange={onTrackChange} />

					<div className="transport-bar__spacer" />

					<VolumeRate
						volume={volume}
						playbackRate={playbackRate}
						onVolumeChange={onVolumeChange}
						onRateChange={onRateChange}
					/>
				</div>
			)}
		</div>
	);
}
