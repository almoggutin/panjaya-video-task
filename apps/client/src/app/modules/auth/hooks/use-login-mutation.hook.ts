import { useMutation } from '@tanstack/react-query';

import type { LoginForm } from '../schemas/login.schema';
import { login } from '../services/auth.service';

export function useLoginMutation() {
	return useMutation({
		mutationFn: (data: LoginForm) => login({ email: data.email, password: data.password }),
	});
}
