import type { ButtonHTMLAttributes } from 'react';

import clsx from 'clsx';

import './button.component.css';

import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	fullWidth?: boolean;
};

export function Button({
	variant = ButtonVariant.DEFAULT,
	size = ButtonSize.MD,
	fullWidth = false,
	className,
	children,
	...props
}: ButtonProps) {
	const cls: string = clsx(
		'btn',
		variant !== ButtonVariant.DEFAULT && `btn-${variant}`,
		size !== ButtonSize.MD && `btn-${size}`,
		fullWidth && 'btn-full',
		className
	);

	return (
		<button className={cls} {...props}>
			{children}
		</button>
	);
}
