import { isStrongPassword } from 'validator';

export class Utils {
	static generateUUID(): string {
		return crypto.randomUUID();
	}

	static mbToBytes(mb: number): number {
		return mb * 1024 * 1024;
	}

	static getPasswordStrength(password: string): number {
		if (!password) return 0;
		const score = isStrongPassword(password, { returnScore: true });
		if (score >= 40) return 4;
		if (score >= 30) return 3;
		if (score >= 20) return 2;
		return 1;
	}

	static formatDate(iso: string): string {
		return new Intl.DateTimeFormat('en', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(new Date(iso));
	}

	static formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
		return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
	}

	static formatDuration(sec: number): string {
		const hours: number = Math.floor(sec / 3600);
		const minutes: number = Math.floor((sec % 3600) / 60);
		const seconds: number = Math.floor(sec % 60);

		if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
		return `${minutes}:${String(seconds).padStart(2, '0')}`;
	}
}
