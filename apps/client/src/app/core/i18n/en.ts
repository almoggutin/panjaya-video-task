export const coreEnTranslation = {
	common: {
		buttons: {
			save: 'Save',
			cancel: 'Cancel',
			delete: 'Delete',
			confirm: 'Confirm',
			logout: 'Logout',
			back: 'Back',
			home: 'Home',
			retry: 'Retry',
		},
		errors: {
			networkError: 'Network error. Please try again.',
			notFound: 'Not found.',
			serverError: 'Something went wrong. Please try again.',
			unauthorized: 'Session expired. Please log in again.',
		},
		loading: 'Loading...',
	},

	shell: {
		header: {
			nav: {
				product: 'Product',
				status: 'Changelog',
				library: 'Library',
				upload: 'Upload',
			},
			toggleTheme: 'Toggle theme',
			openMenu: 'Open menu',
			closeMenu: 'Close menu',
			signInUp: 'Sign in / up',
			github: 'GitHub',
		},
		footer: {
			copyright: '© {{year}} Panjaya Video',
		},
		notFound: {
			title: 'Page not found',
			description: "The page you're looking for doesn't exist or has been moved.",
		},
	},
} as const;
