import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowIcon from '@svgs/arrow.svg?react';

import { UploadDropzone } from './upload-dropzone/upload-dropzone.component';
import { UploadMetadataForm } from './upload-metadata-form/upload-metadata-form.component';
import { Stepper } from '@/app/shared/components/stepper/stepper.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './asset-upload.component.css';

export function AssetUpload() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [file, setFile] = useState<File | null>(null);

	const step: number = file ? 2 : 1;

	return (
		<div className="page">
			<div className="container asset-upload__container">
				<button type="button" className="icon-btn asset-upload__back" onClick={() => navigate('/assets')}>
					<ArrowIcon width={18} height={18} style={{ transform: 'rotate(180deg)' }} />
				</button>

				<div className="asset-upload__heading">
					<h2>{t('assets.upload.title')}</h2>
					<p className="asset-upload__subtitle">{t('assets.upload.subtitle')}</p>
				</div>

				<Stepper currentStep={step}>
					<Stepper.Step label={t('assets.upload.step1')}>
						<UploadDropzone onFileSelect={setFile} />
					</Stepper.Step>

					<Stepper.Step label={t('assets.upload.step2')}>
						{file && (
							<div className="panel">
								<UploadMetadataForm file={file} onBack={() => setFile(null)} />
							</div>
						)}
					</Stepper.Step>
				</Stepper>
			</div>
		</div>
	);
}
