import { useCallback, useRef, useState } from 'react';

import UploadIcon from '@svgs/upload.svg?react';

import { MAX_FILE_SIZE_MB, SUPPORTED_MIME_TYPES } from '../../../constants/upload-asset.constants';
import { Utils } from '@/app/core/utils/common.utils';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import type { TranslationKey } from '@/app/shared/hooks/i18n.hook';

import './upload-dropzone.component.css';

type UploadDropzoneProps = {
	onFileSelect: (file: File) => void;
};

export function UploadDropzone({ onFileSelect }: UploadDropzoneProps) {
	const { t } = useTranslation();
	const inputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const validateFile = useCallback((file: File): TranslationKey | null => {
		if (!SUPPORTED_MIME_TYPES.includes(file.type as (typeof SUPPORTED_MIME_TYPES)[number]))
			return 'assets.upload.unsupportedFormat';
		if (file.size > Utils.mbToBytes(MAX_FILE_SIZE_MB)) return 'assets.upload.sizeLimit';

		return null;
	}, []);

	const handleFile = (file: File) => {
		const err: TranslationKey | null = validateFile(file);
		if (!err) {
			setError(null);
			onFileSelect(file);

			return;
		}

		setError(err === 'assets.upload.sizeLimit' ? t('assets.upload.sizeLimit', { max: MAX_FILE_SIZE_MB }) : t(err));
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const file: File = e.dataTransfer.files[0];
		if (!file) return;

		handleFile(file);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file: File | undefined = e.target.files?.[0];
		if (!file) return;

		handleFile(file);
	};

	return (
		<div className="upload-dropzone-wrap">
			<div
				className={`upload-dropzone ${isDragging ? 'upload-dropzone--dragging' : ''}`}
				onClick={() => inputRef.current?.click()}
				onDragOver={(e) => {
					e.preventDefault();
					setIsDragging(true);
				}}
				onDragLeave={() => setIsDragging(false)}
				onDrop={handleDrop}
			>
				<div className="upload-dropzone__icon">
					<UploadIcon width={24} height={24} />
				</div>

				<p className="upload-dropzone__label">{t('assets.upload.dropzone')}</p>
				<p className="upload-dropzone__hint">{t('assets.upload.sizeLimit', { max: MAX_FILE_SIZE_MB })}</p>

				<input
					ref={inputRef}
					type="file"
					accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
					className="upload-dropzone__input"
					onChange={handleChange}
				/>
			</div>

			{error && <p className="upload-dropzone__error">{error}</p>}
		</div>
	);
}
