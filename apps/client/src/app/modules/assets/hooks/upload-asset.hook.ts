import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { IUploadAssetVariables } from '../models/asset.models';
import { uploadAsset } from '../services/assets.service';
import { ASSETS_QUERY_KEY } from './asset-list.hook';

export function useUploadAsset() {
	const [progress, setProgress] = useState(0);
	const abortRef = useRef<AbortController | null>(null);
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: ({ file, title, description }: IUploadAssetVariables) => {
			setProgress(0);
			abortRef.current = new AbortController();
			return uploadAsset(file, title, description, setProgress, abortRef.current.signal);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [ASSETS_QUERY_KEY] });
		},
	});

	const cancel = () => abortRef.current?.abort();

	return { ...mutation, progress, cancel };
}
