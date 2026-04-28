import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { Language } from '@/app/core/models/localization.models';
import { Theme, type IToast, type IPushToastOptions } from '@/app/core/models/theme.models';
import { Utils } from '@/app/core/utils/common.utils';
import { resolveToastMessage } from '@/app/core/utils/toast.utils';

export interface IUiState {
	theme: Theme;
	language: Language;
	toastQueue: IToast[];
	modals: string[];
	blockingLoader: boolean;
}

const initialState: IUiState = {
	theme: Theme.LIGHT,
	language: Language.EN,
	toastQueue: [],
	modals: [],
	blockingLoader: false,
};

export const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		setTheme(state, action: PayloadAction<Theme>) {
			state.theme = action.payload;
		},
		toggleTheme(state) {
			const theme: Theme = state.theme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
			state.theme = theme;
		},
		setLanguage(state, action: PayloadAction<Language>) {
			state.language = action.payload;
		},
		pushToast(state, action: PayloadAction<IPushToastOptions>) {
			const message: string = resolveToastMessage(action.payload);
			state.toastQueue.push({ type: action.payload.type, message, id: Utils.generateUUID() });
		},
		dismissToast(state, action: PayloadAction<string>) {
			state.toastQueue = state.toastQueue.filter((toast: IToast) => toast.id !== action.payload);
		},
		openModal(state, action: PayloadAction<string>) {
			if (!state.modals.includes(action.payload)) {
				state.modals.push(action.payload);
			}
		},
		closeModal(state, action: PayloadAction<string>) {
			state.modals = state.modals.filter((modal: string) => modal !== action.payload);
		},
		setBlockingLoader(state, action: PayloadAction<boolean>) {
			state.blockingLoader = action.payload;
		},
	},
});

export const { setTheme, toggleTheme, setLanguage, pushToast, dismissToast, openModal, closeModal, setBlockingLoader } =
	uiSlice.actions;
