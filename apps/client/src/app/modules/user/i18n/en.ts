export const userEnTranslation = {
	user: {
		profile: {
			title: 'Profile settings',
			identity: {
				firstName: 'first name',
				lastName: 'last name',
				email: 'email',
				emailHint: 'Used for sign-in and processing notifications.',
				saveButton: 'Save changes',
				updateSuccess: 'Profile updated.',
			},
			password: {
				current: 'current password',
				new: 'new password',
				confirm: 'confirm new password',
				updateButton: 'Update password',
				updateSuccess: 'Password updated.',
			},
			deleteAccount: {
				title: 'Delete account',
				confirm: 'Type your email to confirm account deletion. This is permanent.',
				emailMismatch: 'Email does not match.',
			},
		},
	},
} as const;
