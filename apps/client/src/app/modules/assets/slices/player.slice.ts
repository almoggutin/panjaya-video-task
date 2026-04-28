import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { ActiveTrack, type PlaybackRate } from '../models/asset.models';
import { PLAYBACK_RATES } from '../constants/player.constants';

export interface IPlayerState {
	activeTrack: ActiveTrack;
	volume: number;
	playbackRate: PlaybackRate;
}

const initialState: IPlayerState = {
	activeTrack: ActiveTrack.ORIGINAL,
	volume: 0.85,
	playbackRate: 1,
};

export const playerSlice = createSlice({
	name: 'player',
	initialState,
	reducers: {
		setActiveTrack(state, action: PayloadAction<ActiveTrack>) {
			state.activeTrack = action.payload;
		},
		setVolume(state, action: PayloadAction<number>) {
			state.volume = Math.max(0, Math.min(1, action.payload));
		},
		setPlaybackRate(state, action: PayloadAction<PlaybackRate>) {
			if (PLAYBACK_RATES.includes(action.payload)) {
				state.playbackRate = action.payload;
			}
		},
	},
});

export const { setActiveTrack, setVolume, setPlaybackRate } = playerSlice.actions;
