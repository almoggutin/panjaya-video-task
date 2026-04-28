import type { TranslationKey } from '@/app/core/models/localization.models';

export interface IAuthHandle {
	title: TranslationKey;
	subtitle: TranslationKey;
}

export interface IForgotPasswordRequest {
	email: string;
}

export interface ILoginRequest {
	email: string;
	password: string;
}

export interface ISignupRequest {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

export interface IAuthTokens {
	accessToken: string;
	refreshToken: string;
}

export interface IAuthResponse extends IAuthTokens {
	tokenType: string;
	expiresIn: number;
}
