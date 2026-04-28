import { useMemo } from 'react';

import { WaveformVariant } from '../../../models/asset.models';
import { WaveRow } from './wave-row/wave-row.component';
import { peaksFor } from './waveform.utils';

import './waveform.component.css';

type WaveformProps = {
	assetId: string;
	currentTime: number;
	duration: number;
	gainA: number;
	gainB: number;
	onSeek: (t: number) => void;
};

export function Waveform({ assetId, currentTime, duration, gainA, gainB, onSeek }: WaveformProps) {
	const peaksA = useMemo(() => peaksFor(assetId, 260, WaveformVariant.ORIGINAL), [assetId]);
	const peaksB = useMemo(() => peaksFor(assetId, 260, WaveformVariant.MODIFIED), [assetId]);
	const progress: number = duration > 0 ? currentTime / duration : 0;

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const r = e.currentTarget.getBoundingClientRect();
		onSeek(((e.clientX - r.left) / r.width) * duration);
	};

	return (
		<div className="waveform">
			<div className="waveform__header">
				<span className="waveform__label mono">waveform</span>
				<div className="waveform__legend mono">
					<span className="waveform__legend-item" style={{ color: 'var(--sand)' }}>
						<span className="waveform__legend-line" style={{ background: 'var(--sand)' }} />
						original
					</span>
					<span className="waveform__legend-item" style={{ color: 'var(--bronze)' }}>
						<span className="waveform__legend-line" style={{ background: 'var(--bronze)' }} />
						modified
					</span>
				</div>
			</div>

			<div className="waveform__track-label mono">original · gain={gainA.toFixed(2)}</div>
			<WaveRow peaks={peaksA} progress={progress} color="var(--sand)" dim={gainA < 0.5} onClick={handleClick} />

			<div className="waveform__track-label mono">modified · gain={gainB.toFixed(2)}</div>
			<WaveRow peaks={peaksB} progress={progress} color="var(--bronze)" dim={gainB < 0.5} onClick={handleClick} />
		</div>
	);
}
