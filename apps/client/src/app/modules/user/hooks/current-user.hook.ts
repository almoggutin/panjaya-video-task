import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { userLoaded } from '@/app/core/slices/auth.slice';
import { useAppDispatch, useAppSelector } from '@/app/core/store/hooks';
import { getUser } from '../services/user.service';

export const CURRENT_USER_QUERY_KEY = ['user', 'me'] as const;

export function useCurrentUser() {
	const dispatch = useAppDispatch();
	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

	const query = useQuery({
		queryKey: CURRENT_USER_QUERY_KEY,
		queryFn: getUser,
		enabled: isAuthenticated,
	});

	useEffect(() => {
		if (query.data) dispatch(userLoaded(query.data));
	}, [query.data, dispatch]);

	return query;
}
