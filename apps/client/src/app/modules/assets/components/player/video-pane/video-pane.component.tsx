import PlayIcon from '@svgs/play.svg?react';

import { ActiveTrack } from '../../../models/asset.models';
import { Utils } from '@/app/core/utils/common.utils';

import './video-pane.component.css';

type VideoPaneProps = {
	videoRef: React.RefObject<HTMLVideoElement | null>;
	audioARef: React.RefObject<HTMLAudioElement | null>;
	audioBRef: React.RefObject<HTMLAudioElement | null>;
	timecodeRef: React.RefObject<HTMLSpanElement | null>;
	videoSrc: string | undefined;
	audioSrc: string | undefined;
	modifiedAudioSrc: string | undefined;
	thumbnailSrc: string | undefined;
	playing: boolean;
	duration: number;
	activeTrack: ActiveTrack;
	onPlayPause: () => void;
	onLoadedMetadata: () => void;
	onPlay: () => void;
	onPause: () => void;
	onEnded: () => void;
};

export function VideoPane({
	videoRef,
	audioARef,
	audioBRef,
	timecodeRef,
	videoSrc,
	audioSrc,
	modifiedAudioSrc,
	thumbnailSrc,
	playing,
	duration,
	activeTrack,
	onPlayPause,
	onLoadedMetadata,
	onPlay,
	onPause,
	onEnded,
}: VideoPaneProps) {
	return (
		<div className="video-pane">
			<div className="video-pane__aspect">
				<video
					ref={videoRef}
					className="video-pane__video"
					src={videoSrc}
					poster={thumbnailSrc}
					muted
					playsInline
					onLoadedMetadata={onLoadedMetadata}
					onEnded={onEnded}
					onPlay={onPlay}
					onPause={onPause}
				/>
				<audio ref={audioARef} src={audioSrc} preload="auto" />
				<audio ref={audioBRef} src={modifiedAudioSrc} preload="auto" />

				<div
					className={`video-pane__overlay${playing ? ' video-pane__overlay--playing' : ''}`}
					onClick={onPlayPause}
				/>

				{!playing && (
					<div className="video-pane__play-center">
						<button
							type="button"
							className="video-pane__big-play"
							onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
						>
							<PlayIcon width={28} height={28} />
						</button>
					</div>
				)}

				<div className="video-pane__chips">
					<span className="video-pane__chip mono">video.muted = true</span>
					<span
						className="video-pane__chip mono"
						style={{ color: activeTrack === ActiveTrack.ORIGINAL ? 'var(--sand)' : '#fff' }}
					>
						audio.{activeTrack}
					</span>
				</div>

				<div className="video-pane__timecode mono">
					<span ref={timecodeRef}>0:00</span>
					{' / '}
					{Utils.formatDuration(duration)}
				</div>
			</div>
		</div>
	);
}
