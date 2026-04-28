export class LocalStorage {
	static getItem<T = string>(key: string): T | null {
		const raw = localStorage.getItem(key);
		if (raw === null) return null;
		try {
			return JSON.parse(raw) as T;
		} catch {
			return null;
		}
	}

	static setItem(key: string, value: unknown): void {
		if (value == null) return;
		localStorage.setItem(key, JSON.stringify(value));
	}

	static removeItem(key: string): void {
		localStorage.removeItem(key);
	}

	static clear(): void {
		localStorage.clear();
	}
}
