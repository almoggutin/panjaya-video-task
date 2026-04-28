import { combineReducers } from '@reduxjs/toolkit';

import { authSlice } from '@/app/core/slices/auth.slice';
import { uiSlice } from '@/app/core/slices/ui.slice';
import { playerSlice } from '@/app/modules/assets/slices/player.slice';

export const rootReducer = combineReducers({
	ui: uiSlice.reducer,
	auth: authSlice.reducer,
	player: playerSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
