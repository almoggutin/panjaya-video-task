import type { ReactNode } from 'react';

import type { ChipVariant } from '@/app/shared/models/chip.models';
import { CHIP_VARIANT_CLASS } from '@/app/shared/constants/chip.constants';

import './chip.component.css';

type ChipProps = {
	variant?: ChipVariant;
	dot?: boolean;
	pulse?: boolean;
	children: ReactNode;
};

export function Chip({ variant, dot, pulse, children }: ChipProps) {
	const chipClass: string = `chip${variant ? ` ${CHIP_VARIANT_CLASS[variant]}` : ''}`;
	const dotClass: string = `chip__dot${pulse ? ' chip__dot--pulse' : ''}`;

	return (
		<span className={chipClass}>
			{dot && <span className={dotClass} />}
			{children}
		</span>
	);
}
