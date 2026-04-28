import './wave-bar.component.css';

type WaveBarProps = {
	peak: number;
	played: boolean;
	color: string;
	dim: boolean;
};

function resolveBarBackground(played: boolean, dim: boolean, color: string): string {
	if (played && !dim) return color;
	if (played) return `color-mix(in srgb, ${color} 40%, transparent)`;
	if (dim) return 'var(--line-soft)';

	return 'var(--fg-faint)';
}

export function WaveBar({ peak, played, color, dim }: WaveBarProps) {
	const background: string = resolveBarBackground(played, dim, color);

	return (
		<div
			className="wave-bar"
			style={{
				height: `${peak * 44}px`,
				background: background,
				opacity: dim ? 0.35 : 1,
			}}
		/>
	);
}
