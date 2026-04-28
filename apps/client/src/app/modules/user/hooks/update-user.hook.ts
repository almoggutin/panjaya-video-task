import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userLoaded } from '@/app/core/slices/auth.slice';
import { useAppDispatch } from '@/app/core/store/hooks';
import type { UpdateProfileForm } from '../schemas/update-profile.schema';
import { updateUser } from '../services/user.service';
import { CURRENT_USER_QUERY_KEY } from './current-user.hook';

export function useUpdateUser() {
	const dispatch = useAppDispatch();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: UpdateProfileForm) => updateUser(data.firstName, data.lastName, data.email),
		onSuccess: (updatedUser) => {
			dispatch(userLoaded(updatedUser));
			queryClient.setQueryData(CURRENT_USER_QUERY_KEY, updatedUser);
		},
	});
}
