import type { ButtonHTMLAttributes } from 'react';
import './icon-button.component.css';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function IconButton({ className, children, ...props }: IconButtonProps) {
	return (
		<button className={`icon-btn${className ? ` ${className}` : ''}`} {...props}>
			{children}
		</button>
	);
}
