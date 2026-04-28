import { WaveBar } from './wave-bar/wave-bar.component';

import './wave-row.component.css';

type WaveRowProps = {
	peaks: number[];
	progress: number;
	color: string;
	dim: boolean;
	onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
};

export function WaveRow({ peaks, progress, color, dim, onClick }: WaveRowProps) {
	return (
		<div className="wave-row" onClick={onClick}>
			<div className="wave-row__bars">
				{peaks.map((peak, i) => (
					<WaveBar key={i} peak={peak} played={i / peaks.length < progress} color={color} dim={dim} />
				))}

				<div
					className="wave-row__playhead"
					style={{ left: `calc(12px + ${progress * 100}% - ${progress * 24}px)` }}
				/>
			</div>
		</div>
	);
}
