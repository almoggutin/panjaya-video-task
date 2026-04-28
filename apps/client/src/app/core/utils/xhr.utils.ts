import { store } from '@/app/core/store/store';
import { env } from '@/app/core/utils/env.utils';
import type { IXhrClientConfig, IXhrOptions } from '@/app/core/models/xhr.models';

class XhrClient {
	private baseURL: string;

	constructor(config: IXhrClientConfig) {
		this.baseURL = config.baseURL;
	}

	async post<T>(path: string, body: FormData, options?: IXhrOptions): Promise<T> {
		const headers: Record<string, string> = {};
		const token = store.getState().auth.accessToken;
		if (token) headers['Authorization'] = `Bearer ${token}`;

		const text = await this.execute('POST', `${this.baseURL}${path}`, body, headers, options);
		return JSON.parse(text) as T;
	}

	async put(url: string, body: XMLHttpRequestBodyInit, options?: IXhrOptions): Promise<void> {
		await this.execute('PUT', url, body, {}, options);
	}

	private execute(
		method: string,
		url: string,
		body: XMLHttpRequestBodyInit,
		headers: Record<string, string>,
		options?: IXhrOptions
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const { signal, onUploadProgress } = options ?? {};

			const xhr = new XMLHttpRequest();

			signal?.addEventListener('abort', () => xhr.abort());
			if (onUploadProgress) {
				xhr.upload.onprogress = (e) => {
					if (e.lengthComputable) onUploadProgress(e.loaded / e.total);
				};
			}

			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve(xhr.responseText);
				} else if (xhr.status === 401) {
					reject(new Error('common.errors.unauthorized'));
				} else {
					reject(new Error('common.errors.serverError'));
				}
			};

			xhr.onerror = () => reject(new Error('common.errors.networkError'));
			xhr.onabort = () => reject(new Error('common.errors.cancelled'));

			xhr.open(method, url);
			for (const [key, value] of Object.entries(headers)) {
				xhr.setRequestHeader(key, value);
			}
			xhr.send(body);
		});
	}
}

export const xhrClient = new XhrClient({ baseURL: env.VITE_API_URL });
