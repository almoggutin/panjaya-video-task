import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import ArrowIcon from '@svgs/arrow.svg?react';
import XCircleIcon from '@svgs/x-circle.svg?react';

import { useUploadAsset } from '../../../hooks/upload-asset.hook';
import { UploadMetadataSchema, type UploadMetadataFormValues } from '../../../schemas/upload-asset.schema';
import { FILE_EXTENSION_REGEX } from '../../../constants/upload-asset.constants';
import { UploadProgressBar } from './upload-progress-bar/upload-progress-bar.component';
import { pushToast } from '@/app/core/slices/ui.slice';
import { ToastType } from '@/app/core/models/theme.models';
import { useAppDispatch } from '@/app/core/store/hooks';
import { Button } from '@/app/shared/components/button/button.component';
import { FormField } from '@/app/shared/components/form-field/form-field.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import { ButtonSize, ButtonVariant } from '@/app/shared/models/button.models';

import './upload-metadata-form.component.css';

type UploadMetadataFormProps = {
	file: File;
	onBack: () => void;
};

export function UploadMetadataForm({ file, onBack }: UploadMetadataFormProps) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { mutate: upload, isPending, progress, cancel, data } = useUploadAsset();

	const defaultTitle = file.name.replace(FILE_EXTENSION_REGEX, '');

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<UploadMetadataFormValues>({
		resolver: zodResolver(UploadMetadataSchema),
		defaultValues: { title: defaultTitle },
	});

	useEffect(() => {
		if (data) navigate(`/assets/${data.id}`);
	}, [data, navigate]);

	const onSubmit = (formData: UploadMetadataFormValues) => {
		upload({ file, ...formData }, { onError: (err) => dispatch(pushToast({ type: ToastType.ERROR, error: err })) });
	};

	if (isPending) {
		return (
			<div className="upload-metadata-form__progress">
				<UploadProgressBar filename={file.name} progress={progress} onCancel={cancel} />
			</div>
		);
	}

	return (
		<form className="upload-metadata-form" onSubmit={handleSubmit(onSubmit)}>
			<div className="upload-metadata-form__file">
				<span className="upload-metadata-form__file-name">{file.name}</span>
				<button type="button" className="upload-metadata-form__back icon-btn" title={t('assets.upload.back')} onClick={onBack}>
					<XCircleIcon width={16} height={16} />
				</button>
			</div>

			<div className="upload-metadata-form__body">
				<FormField label="assets.upload.titleField" error={errors.title} autoFocus {...register('title')} />

				<FormField
					label="assets.upload.descriptionField"
					error={errors.description}
					{...register('description')}
				/>

				<div className="upload-metadata-form__actions">
					<Button
						type="button"
						variant={ButtonVariant.DEFAULT}
						size={ButtonSize.MD}
						onClick={() => navigate('/assets')}
					>
						{t('assets.upload.cancel')}
					</Button>

					<Button type="submit" variant={ButtonVariant.PRIMARY} size={ButtonSize.MD}>
						<span>{t('assets.upload.button')}</span>
						<ArrowIcon width={14} height={14} />
					</Button>
				</div>
			</div>
		</form>
	);
}
