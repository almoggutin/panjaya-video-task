export enum Theme {
	LIGHT = 'light',
	DARK = 'dark',
}

export enum ToastType {
	SUCCESS = 'success',
	ERROR = 'error',
	INFO = 'info',
	WARN = 'warn',
}

export interface IToast {
	id: string;
	message: string;
	type: ToastType;
}

export interface IPushToastOptions {
	type: ToastType;
	message?: string;
	error?: unknown;
}
