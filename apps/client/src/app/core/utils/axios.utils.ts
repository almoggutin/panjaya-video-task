import axios, { isAxiosError } from 'axios';

import { loggedIn, loggedOut } from '@/app/core/slices/auth.slice';
import { store } from '@/app/core/store/store';
import { env } from '@/app/core/utils/env.utils';
import type { IAuthResponse } from '@/app/modules/auth/models/auth.models';

export const axiosInstance = axios.create({
	baseURL: env.VITE_API_URL,
	headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
	const token = store.getState().auth.accessToken;
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(err: unknown, token: string | null): void {
	failedQueue.forEach((p) => (err ? p.reject(err) : p.resolve(token!)));
	failedQueue = [];
}

function enqueueRequest(config: Record<string, unknown>): Promise<unknown> {
	return new Promise<string>((resolve, reject) => {
		failedQueue.push({ resolve, reject });
	}).then((token) => {
		config.headers = { ...(config.headers as object), Authorization: `Bearer ${token}` };
		return axiosInstance(config);
	});
}

function shouldRetry(error: unknown, config: Record<string, unknown>): boolean {
	return (
		isAxiosError(error) &&
		error.response?.status === 401 &&
		!config._retry &&
		!String(config.url ?? '').startsWith('/auth/')
	);
}

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const original = error.config;

		if (!shouldRetry(error, original)) {
			return Promise.reject(error);
		}

		if (isRefreshing) {
			return enqueueRequest(original);
		}

		original._retry = true;
		isRefreshing = true;

		try {
			const refreshToken = store.getState().auth.refreshToken;
			const { data } = await axiosInstance.post<IAuthResponse>('/auth/refresh', { refreshToken });
			store.dispatch(loggedIn({ accessToken: data.accessToken, refreshToken: data.refreshToken }));
			original.headers.Authorization = `Bearer ${data.accessToken}`;
			processQueue(null, data.accessToken);
			return axiosInstance(original);
		} catch (err) {
			processQueue(err, null);
			store.dispatch(loggedOut());
			window.location.href = '/auth/login';
			return Promise.reject(err);
		} finally {
			isRefreshing = false;
		}
	},
);
