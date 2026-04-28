import { useMutation } from '@tanstack/react-query';

import type { SignupForm } from '../schemas/signup.schema';
import { signup } from '../services/auth.service';

export function useSignupMutation() {
	return useMutation({
		mutationFn: (data: SignupForm) => signup({ email: data.email, password: data.password, firstName: data.firstName, lastName: data.lastName }),
	});
}
