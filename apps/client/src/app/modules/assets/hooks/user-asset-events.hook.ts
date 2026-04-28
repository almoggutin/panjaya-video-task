import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { useAppSelector } from '@/app/core/store/hooks';
import { subscribeToUserEvents } from '../services/assets-events.service';
import { AssetStatus, type IAsset } from '../models/asset.models';
import type { IErrorEventData, IReadyEventData, IStatusEventData } from '../models/asset-event.models';
import { ASSET_QUERY_KEY } from './asset-detail.hook';
import { ASSETS_QUERY_KEY } from './asset-list.hook';

export function useUserAssetEvents() {
	const queryClient = useQueryClient();
	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
	const accessToken = useAppSelector((state) => state.auth.accessToken);

	useEffect(() => {
		if (!isAuthenticated || !accessToken) return;

		const patch = (assetId: string, update: Partial<IAsset>) =>
			queryClient.setQueryData<IAsset>([ASSET_QUERY_KEY, assetId], (prev) =>
				prev ? { ...prev, ...update } : prev
			);

		const handleStatus = ({ assetId, state, progress }: IStatusEventData) => {
			patch(assetId, { status: state, progress });
			queryClient.setQueryData([ASSET_QUERY_KEY, assetId, 'progress'], progress);
		};

		const handleReady = ({ assetId, ...fields }: IReadyEventData) => {
			patch(assetId, { status: AssetStatus.READY, progress: 1, ...fields });
			queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
		};

		const handleError = ({ assetId, message }: IErrorEventData) => {
			patch(assetId, { status: AssetStatus.FAILED, errorMessage: message });
		};

		return subscribeToUserEvents(({ type, data }) => {
			if (type === 'status') handleStatus(data);
			else if (type === 'ready') handleReady(data);
			else if (type === 'error') handleError(data);
		});
	}, [isAuthenticated, accessToken, queryClient]);
}
