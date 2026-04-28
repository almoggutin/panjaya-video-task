export class SessionStorage {
	static getItem<T = string>(key: string): T | null {
		const raw = sessionStorage.getItem(key);
		if (raw === null) return null;
		try {
			return JSON.parse(raw) as T;
		} catch {
			return null;
		}
	}

	static setItem(key: string, value: unknown): void {
		if (value == null) return;
		sessionStorage.setItem(key, JSON.stringify(value));
	}

	static removeItem(key: string): void {
		sessionStorage.removeItem(key);
	}

	static clear(): void {
		sessionStorage.clear();
	}
}
