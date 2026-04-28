import RewindIcon from '@svgs/rewind.svg?react';
import ForwardIcon from '@svgs/forward.svg?react';
import PlayIcon from '@svgs/play.svg?react';
import PauseIcon from '@svgs/pause.svg?react';

import './playback-btns.component.css';

type PlaybackBtnsProps = {
	playing: boolean;
	onPlayPause: () => void;
	onSkip: (deltaSeconds: number) => void;
};

export function PlaybackBtns({ playing, onPlayPause, onSkip }: PlaybackBtnsProps) {
	return (
		<div className="playback-btns">
			<button type="button" className="icon-btn" onClick={() => onSkip(-5)}>
				<RewindIcon width={14} height={14} />
			</button>
			<button type="button" className="icon-btn playback-btns__play-btn" onClick={onPlayPause}>
				{playing ? <PauseIcon width={14} height={14} /> : <PlayIcon width={14} height={14} />}
			</button>
			<button type="button" className="icon-btn" onClick={() => onSkip(5)}>
				<ForwardIcon width={14} height={14} />
			</button>
		</div>
	);
}
