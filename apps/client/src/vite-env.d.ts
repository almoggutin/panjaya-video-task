/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
	// Vite built-in constants
	readonly MODE: string;
	readonly BASE_URL: string;
	readonly PROD: boolean;
	readonly DEV: boolean;
	readonly SSR: boolean;

	// App environment variables
	readonly VITE_API_URL: string;
	readonly VITE_GITHUB_URL: string;
	readonly VITE_MAX_UPLOAD_MB: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
declare const __CHANGELOG__: string;
