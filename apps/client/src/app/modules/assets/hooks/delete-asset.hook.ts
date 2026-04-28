import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteAsset } from '../services/assets.service';
import { ASSETS_QUERY_KEY } from './asset-list.hook';

export function useDeleteAsset() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteAsset(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
		},
	});
}
