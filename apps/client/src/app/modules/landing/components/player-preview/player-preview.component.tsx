import { useState } from 'react';

import { PLAYER_PEAKS, PLAYER_PLAYED_BARS } from '../../constants/player-preview.constants';
import { AudioTrack } from '../../models/landing.models';

import './player-preview.component.css';

export function PlayerPreview() {
	const [track, setTrack] = useState<AudioTrack>(AudioTrack.ORIGINAL);

	return (
		<div className="player-preview">
			<div className="player-preview__header">
				<div className="player-preview__chip">
					<span className="player-preview__chip-dot" />
					READY
				</div>
				<span className="player-preview__meta">vid_9k3xp2 · 2:48</span>
			</div>

			<div className="player-preview__video">
				<button className="player-preview__play-btn" aria-label="Play">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
						<path d="M6 4l14 8-14 8V4z" />
					</svg>
				</button>
			</div>

			<div className="player-preview__waveform">
				{PLAYER_PEAKS.map((peak, i) => (
					<div
						key={i}
						className={`player-preview__bar${i < PLAYER_PLAYED_BARS ? ' played' : ''}`}
						style={{ height: `${peak * 32}px` }}
					/>
				))}
			</div>

			<div className="player-preview__controls">
				<div className="player-preview__track-toggle">
					<button
						className={`player-preview__track${track === AudioTrack.ORIGINAL ? ' active' : ''}`}
						onClick={() => setTrack(AudioTrack.ORIGINAL)}
					>
						Original
					</button>
					<button
						className={`player-preview__track${track === AudioTrack.MODIFIED ? ' active' : ''}`}
						onClick={() => setTrack(AudioTrack.MODIFIED)}
					>
						Modified
					</button>
				</div>
			</div>
		</div>
	);
}
