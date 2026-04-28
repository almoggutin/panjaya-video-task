import { useQuery } from '@tanstack/react-query';

import { getAsset } from '../services/assets.service';

export const ASSET_QUERY_KEY = 'asset' as const;

export function useAsset(id: string) {
	return useQuery({
		queryKey: [ASSET_QUERY_KEY, id],
		queryFn: () => getAsset(id),
	});
}
