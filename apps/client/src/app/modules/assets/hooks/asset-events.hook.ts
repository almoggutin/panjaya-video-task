import { useQuery } from '@tanstack/react-query';

import { ASSET_QUERY_KEY } from './asset-detail.hook';

export function useAssetEvents(assetId: string) {
	const { data: progress = 0 } = useQuery<number>({
		queryKey: [ASSET_QUERY_KEY, assetId, 'progress'],
		queryFn: async () => 0,
		staleTime: Infinity,
		initialData: 0,
	});

	return { progress };
}
