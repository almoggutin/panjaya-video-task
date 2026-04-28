import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { IAuthTokens } from '@/app/modules/auth/models/auth.models';
import type { IUser } from '@/app/modules/user/models/user.models';

export interface IAuthState {
	isAuthenticated: boolean;
	accessToken: string | null;
	refreshToken: string | null;
	user: IUser | null;
}

const initialState: IAuthState = {
	isAuthenticated: false,
	accessToken: null,
	refreshToken: null,
	user: null,
};

export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		loggedIn(state, action: PayloadAction<IAuthTokens>) {
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken;
			state.isAuthenticated = true;
		},
		loggedOut(state) {
			state.isAuthenticated = false;
			state.accessToken = null;
			state.refreshToken = null;
			state.user = null;
		},
		userLoaded(state, action: PayloadAction<IUser>) {
			state.user = action.payload;
		},
	},
});

export const { loggedIn, loggedOut, userLoaded } = authSlice.actions;
