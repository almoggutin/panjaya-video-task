import { useMutation, useQueryClient } from '@tanstack/react-query';

import { loggedOut } from '@/app/core/slices/auth.slice';
import { useAppDispatch } from '@/app/core/store/hooks';
import { deleteUser } from '../services/user.service';

export function useDeleteUser() {
	const dispatch = useAppDispatch();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			dispatch(loggedOut());
			queryClient.clear();
		},
	});
}
