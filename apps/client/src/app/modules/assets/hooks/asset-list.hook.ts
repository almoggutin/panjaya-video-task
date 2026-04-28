import { useQuery } from '@tanstack/react-query';

import { listAssets } from '../services/assets.service';
import type { IListAssetsParams } from '../models/asset.models';

export const ASSETS_QUERY_KEY = 'assets' as const;

export function useAssets(params: IListAssetsParams) {
	return useQuery({
		queryKey: [ASSETS_QUERY_KEY, params],
		queryFn: () => listAssets(params),
	});
}
