import type { ComponentProps, ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';

import { useTranslation, type TranslationKey } from '@/app/shared/hooks/i18n.hook';

import './form-field.component.css';

type FormFieldProps = ComponentProps<'input'> & {
	label: TranslationKey;
	error?: FieldError;
	labelAction?: ReactNode;
	suffix?: ReactNode;
	hint?: ReactNode;
};

export function FormField({ label, error, labelAction, suffix, hint, ...inputProps }: FormFieldProps) {
	const { t } = useTranslation();

	return (
		<div className="form-field">
			<label className="form-field__label">
				{t(label)}
				{labelAction}
			</label>

			{suffix ? (
				<div className="form-input-wrap">
					<input className="form-input" aria-invalid={!!error} {...inputProps} />
					{suffix}
				</div>
			) : (
				<input className="form-input" aria-invalid={!!error} {...inputProps} />
			)}

			{hint}

			{error && <span className="form-field__error">{t(error.message as TranslationKey)}</span>}
		</div>
	);
}
