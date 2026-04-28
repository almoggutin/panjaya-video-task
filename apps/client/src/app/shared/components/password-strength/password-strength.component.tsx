import { useCallback, useMemo } from 'react';

import { STRENGTH_COLORS, STRENGTH_LABELS } from '@/app/shared/constants/password.constants';
import { Utils } from '@/app/core/utils/common.utils';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './password-strength.component.css';

type PasswordStrengthProps = {
	password: string;
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
	const { t } = useTranslation();

	const computeStrength = useCallback(() => Utils.getPasswordStrength(password), [password]);
	const strength = computeStrength();

	const color = useMemo(() => STRENGTH_COLORS[strength - 1] ?? STRENGTH_COLORS[0], [strength]);
	const label = useMemo(() => t(STRENGTH_LABELS[strength - 1]), [strength, t]);

	if (!password) return null;

	return (
		<div className="password-strength">
			<div className="password-strength__bars">
				{[1, 2, 3, 4].map((i) => (
					<div
						key={i}
						className="password-strength__bar"
						style={{ background: i <= strength ? color : 'var(--line-soft)' }}
					/>
				))}
			</div>

			<span className="password-strength__label" style={{ color }}>
				{label}
			</span>
		</div>
	);
}
