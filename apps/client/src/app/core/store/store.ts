import { configureStore } from '@reduxjs/toolkit';

import { Language } from '@/app/core/models/localization.models';
import { Theme } from '@/app/core/models/theme.models';
import { StorageKey } from '@/app/core/models/storage.models';
import { LocalStorage } from '@/app/core/utils/local-storage.utils';

import type { IUser } from '@/app/modules/user/models/user.models';
import { listenerMiddleware } from './listener-middleware';
import { rootReducer } from './root-reducer';

function loadPersistedState() {
	return {
		ui: {
			theme: LocalStorage.getItem<Theme>(StorageKey.THEME) ?? Theme.LIGHT,
			language: LocalStorage.getItem<Language>(StorageKey.LANGUAGE) ?? Language.EN,
			toastQueue: [],
			modals: [],
		},
		auth: {
			isAuthenticated: LocalStorage.getItem<boolean>(StorageKey.AUTH) ?? false,
			accessToken: LocalStorage.getItem<string>(StorageKey.ACCESS_TOKEN) ?? null,
			refreshToken: LocalStorage.getItem<string>(StorageKey.REFRESH_TOKEN) ?? null,
			user: LocalStorage.getItem<IUser>(StorageKey.USER) ?? null,
		},
	};
}

export const store = configureStore({
	reducer: rootReducer,
	preloadedState: loadPersistedState(),
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type AppDispatch = typeof store.dispatch;
