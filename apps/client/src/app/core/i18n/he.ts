export const coreHeTranslation = {
	common: {
		buttons: {
			save: 'שמור',
			cancel: 'ביטול',
			delete: 'מחק',
			confirm: 'אישור',
			logout: 'התנתק',
			back: 'חזור',
			home: 'בית',
			retry: 'נסה שוב',
		},
		errors: {
			networkError: 'שגיאת רשת. אנא נסה שוב.',
			notFound: 'לא נמצא.',
			serverError: 'משהו השתבש. אנא נסה שוב.',
			unauthorized: 'הפעלה פגה. אנא התחבר מחדש.',
		},
		loading: 'טוען...',
	},
	shell: {
		header: {
			nav: {
				product: 'מוצר',
				status: 'Changelog',
				library: 'ספרייה',
				upload: 'העלאה',
			},
			toggleTheme: 'החלף ערכת נושא',
			openMenu: 'פתח תפריט',
			closeMenu: 'סגור תפריט',
			signInUp: 'כניסה / הרשמה',
			github: 'GitHub',
		},
		footer: {
			copyright: '© {{year}} Panjaya Video',
		},
		notFound: {
			title: 'הדף לא נמצא',
			description: 'הדף שחיפשת אינו קיים או שהועבר.',
		},
	},
} as const;
