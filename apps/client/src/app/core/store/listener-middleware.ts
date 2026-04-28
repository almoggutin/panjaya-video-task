import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import i18next from 'i18next';

import { loggedIn, loggedOut, userLoaded, type IAuthState } from '@/app/core/slices/auth.slice';
import type { IUser } from '@/app/modules/user/models/user.models';
import { setLanguage, setTheme, toggleTheme } from '@/app/core/slices/ui.slice';
import { StorageKey } from '@/app/core/models/storage.models';
import { LocalStorage } from '@/app/core/utils/local-storage.utils';

export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
	matcher: isAnyOf(setTheme, toggleTheme),
	effect: (_action, listenerApi) => {
		const theme = (listenerApi.getState() as { ui: { theme: string } }).ui.theme;
		LocalStorage.setItem(StorageKey.THEME, theme);
		document.documentElement.setAttribute('data-theme', theme);
	},
});

listenerMiddleware.startListening({
	matcher: isAnyOf(setLanguage),
	effect: (action) => {
		const lang = (action as ReturnType<typeof setLanguage>).payload;
		LocalStorage.setItem(StorageKey.LANGUAGE, lang);
		i18next.changeLanguage(lang);
	},
});

listenerMiddleware.startListening({
	matcher: isAnyOf(loggedIn, loggedOut),
	effect: (_action, listenerApi) => {
		const { isAuthenticated, accessToken, refreshToken } = (listenerApi.getState() as { auth: IAuthState }).auth;
		LocalStorage.setItem(StorageKey.AUTH, isAuthenticated);
		LocalStorage.setItem(StorageKey.ACCESS_TOKEN, accessToken);
		LocalStorage.setItem(StorageKey.REFRESH_TOKEN, refreshToken);
	},
});

listenerMiddleware.startListening({
	matcher: isAnyOf(userLoaded, loggedOut),
	effect: (_action, listenerApi) => {
		const { user } = (listenerApi.getState() as { auth: { user: IUser | null } }).auth;
		LocalStorage.setItem(StorageKey.USER, user);
	},
});
