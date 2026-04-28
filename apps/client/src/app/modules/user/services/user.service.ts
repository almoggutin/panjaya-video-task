import { isAxiosError } from 'axios';

import { axiosInstance } from '@/app/core/utils/axios.utils';
import type { IUpdateProfileRequest, IUser } from '../models/user.models';

export async function getUser(): Promise<IUser> {
	try {
		const { data } = await axiosInstance.get<IUser>('/users/me');
		return mapUser(data);
	} catch (err) {
		throw resolveError(err);
	}
}

export async function updateUser(firstName: string, lastName: string, email: string): Promise<IUser> {
	try {
		const request: IUpdateProfileRequest = { firstName, lastName, email };
		const { data } = await axiosInstance.patch<IUser>('/users/me', request);
		return mapUser(data);
	} catch (err) {
		throw resolveError(err);
	}
}

export async function deleteUser(): Promise<void> {
	try {
		await axiosInstance.delete('/users/me');
	} catch (err) {
		throw resolveError(err);
	}
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
	try {
		await axiosInstance.patch('/users/me/password', { currentPassword, newPassword });
	} catch (err) {
		throw resolveError(err);
	}
}

function mapUser(data: IUser): IUser {
	const initials = `${data.firstName[0] ?? ''}${data.lastName[0] ?? ''}`.toUpperCase();
	return { ...data, initials };
}

function resolveError(err: unknown): Error {
	if (isAxiosError(err)) {
		if (!err.response) return new Error('common.errors.networkError');
		if (err.response.status === 401) return new Error('common.errors.unauthorized');
		if (err.response.status >= 500) return new Error('common.errors.serverError');
	}

	return new Error('common.errors.serverError');
}
