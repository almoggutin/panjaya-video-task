import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { PLAYBACK_RATES } from '../../../../../constants/player.constants';
import type { PlaybackRate } from '../../../../../models/asset.models';

import './rate-select.component.css';

type RateSelectProps = {
	value: PlaybackRate;
	onChange: (r: PlaybackRate) => void;
};

export function RateSelect({ value, onChange }: RateSelectProps) {
	const [open, setOpen] = useState(false);
	const [pos, setPos] = useState({ bottom: 0, left: 0 });
	const triggerRef = useRef<HTMLButtonElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!open && triggerRef.current) {
			const rect = triggerRef.current.getBoundingClientRect();
			setPos({ bottom: window.innerHeight - rect.top + 4, left: rect.left + rect.width / 2 });
		}
		setOpen((v) => !v);
	};

	useEffect(() => {
		if (!open) return;
		const close = (e: MouseEvent) => {
			if (
				!dropdownRef.current?.contains(e.target as Node) &&
				!triggerRef.current?.contains(e.target as Node)
			) {
				setOpen(false);
			}
		};
		document.addEventListener('click', close);
		return () => document.removeEventListener('click', close);
	}, [open]);

	const triggerClass = `rate-select__trigger${open ? ' rate-select__trigger--open' : ''}`;

	return (
		<>
			<button ref={triggerRef} type="button" className={triggerClass} onClick={handleToggle}>
				{value}×
			</button>

			{open &&
				createPortal(
					<div
						ref={dropdownRef}
						className="rate-select__dropdown"
						style={{ bottom: pos.bottom, left: pos.left }}
					>
						{PLAYBACK_RATES.map((rate: PlaybackRate) => {
							const optionClass = `rate-select__option${rate === value ? ' rate-select__option--active' : ''}`;
							return (
								<button
									key={rate}
									type="button"
									className={optionClass}
									onClick={(e) => {
										e.stopPropagation();
										onChange(rate);
										setOpen(false);
									}}
								>
									{rate}×
								</button>
							);
						})}
					</div>,
					document.body,
				)}
		</>
	);
}
