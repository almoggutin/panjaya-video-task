export const userHeTranslation = {
	user: {
		profile: {
			title: 'הגדרות פרופיל',
			identity: {
				firstName: 'שם פרטי',
				lastName: 'שם משפחה',
				email: 'אימייל',
				emailHint: 'משמש להתחברות ולהתראות עיבוד.',
				saveButton: 'שמור שינויים',
				updateSuccess: 'הפרופיל עודכן.',
			},
			password: {
				current: 'סיסמה נוכחית',
				new: 'סיסמה חדשה',
				confirm: 'אמת סיסמה חדשה',
				updateButton: 'עדכן סיסמה',
				updateSuccess: 'הסיסמה עודכנה.',
			},
			deleteAccount: {
				title: 'מחק חשבון',
				confirm: 'הקלד את האימייל שלך לאישור מחיקת החשבון. פעולה זו קבועה.',
				emailMismatch: 'האימייל אינו תואם.',
			},
		},
	},
} as const;
