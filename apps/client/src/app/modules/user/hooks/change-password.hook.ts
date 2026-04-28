import { useMutation } from '@tanstack/react-query';

import type { ChangePasswordForm } from '../schemas/change-password.schema';
import { changePassword } from '../services/user.service';

export function useChangePassword() {
	return useMutation({
		mutationFn: (data: ChangePasswordForm) => changePassword(data.currentPassword, data.newPassword),
	});
}
