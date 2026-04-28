export interface IXhrClientConfig {
	baseURL: string;
}

export interface IXhrOptions {
	signal?: AbortSignal;
	onUploadProgress?: (pct: number) => void;
}
