import { isAxiosError } from 'axios';

import { axiosInstance } from '@/app/core/utils/axios.utils';
import { xhrClient } from '@/app/core/utils/xhr.utils';
import type { IAsset, IListAssetsParams, IListAssetsResponse, IPresignedUploadResponse } from '../models/asset.models';

export async function listAssets(params: IListAssetsParams): Promise<IListAssetsResponse> {
	try {
		const { data } = await axiosInstance.get<IListAssetsResponse>('/assets', { params });
		return data;
	} catch (err) {
		throw resolveError(err);
	}
}

export async function getAsset(id: string): Promise<IAsset> {
	try {
		const { data } = await axiosInstance.get<IAsset>(`/assets/${id}`);
		return data;
	} catch (err) {
		throw resolveError(err);
	}
}

export async function uploadAsset(
	file: File,
	title: string,
	description: string | undefined,
	onProgress: (pct: number) => void,
	signal?: AbortSignal
): Promise<IAsset> {
	try {
		const { data: presigned } = await axiosInstance.post<IPresignedUploadResponse>('/assets', {
			title,
			description: description ?? null,
			filename: file.name,
			sizeBytes: file.size,
			mimeType: file.type,
		});

		await xhrClient.put(presigned.uploadUrl, file, { signal, onUploadProgress: onProgress });

		return getAsset(presigned.assetId);
	} catch (err) {
		throw resolveError(err);
	}
}

export async function deleteAsset(id: string): Promise<void> {
	try {
		await axiosInstance.delete(`/assets/${id}`);
	} catch (err) {
		throw resolveError(err);
	}
}

function resolveError(err: unknown): Error {
	if (isAxiosError(err)) {
		if (!err.response) return new Error('common.errors.networkError');
		if (err.response.status === 401) return new Error('common.errors.unauthorized');
		if (err.response.status >= 500) return new Error('common.errors.serverError');
	}
	return new Error('common.errors.serverError');
}
