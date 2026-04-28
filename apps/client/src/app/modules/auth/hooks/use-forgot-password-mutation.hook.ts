import { useMutation } from '@tanstack/react-query';

import type { ForgotPasswordForm } from '../schemas/forgot-password.schema';
import { forgotPassword } from '../services/auth.service';

export function useForgotPasswordMutation() {
	return useMutation({
		mutationFn: (data: ForgotPasswordForm) => forgotPassword({ email: data.email }),
	});
}
