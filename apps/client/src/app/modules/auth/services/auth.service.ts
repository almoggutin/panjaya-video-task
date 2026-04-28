import { isAxiosError } from 'axios';

import { axiosInstance } from '@/app/core/utils/axios.utils';
import type { IAuthResponse, IForgotPasswordRequest, ILoginRequest, ISignupRequest } from '../models/auth.models';

export async function login(request: ILoginRequest): Promise<IAuthResponse> {
	try {
		const { data } = await axiosInstance.post<IAuthResponse>('/auth/login', request);
		return data;
	} catch (err) {
		throw resolveError(err);
	}
}

export async function signup(request: ISignupRequest): Promise<IAuthResponse> {
	try {
		const { data } = await axiosInstance.post<IAuthResponse>('/auth/signup', request);
		return data;
	} catch (err) {
		throw resolveError(err);
	}
}

export async function forgotPassword(request: IForgotPasswordRequest): Promise<void> {
	try {
		await axiosInstance.post('/auth/forgot-password', request);
	} catch (err) {
		throw resolveError(err);
	}
}

export async function logout(refreshToken: string): Promise<void> {
	try {
		await axiosInstance.post('/auth/logout', { refreshToken });
	} catch {}
}

function resolveError(err: unknown): Error {
	if (isAxiosError(err)) {
		if (!err.response) return new Error('common.errors.networkError');
		if (err.response.status === 401) return new Error('auth.errors.invalidCredentials');
		if (err.response.status === 409) return new Error('auth.errors.emailTaken');
		if (err.response.status >= 500) return new Error('common.errors.serverError');
	}

	return new Error('common.errors.serverError');
}
