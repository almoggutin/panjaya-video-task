import { useState } from 'react';
import type { ComponentProps } from 'react';

import EyeIcon from '@svgs/eye.svg?react';
import EyeOffIcon from '@svgs/eye-off.svg?react';

import { FormField } from '@/app/shared/components/form-field/form-field.component';

type PasswordFieldProps = Omit<ComponentProps<typeof FormField>, 'type' | 'suffix'>;

export function PasswordField({ ...props }: PasswordFieldProps) {
	const [show, setShow] = useState(false);

	return (
		<FormField
			type={show ? 'text' : 'password'}
			suffix={
				<button
					type="button"
					className="form-input__toggle"
					onClick={() => setShow((v) => !v)}
					aria-label={show ? 'Hide password' : 'Show password'}
				>
					{show ? <EyeOffIcon width={14} height={14} /> : <EyeIcon width={14} height={14} />}
				</button>
			}
			{...props}
		/>
	);
}
