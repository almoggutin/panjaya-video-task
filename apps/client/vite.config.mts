/// <reference types='vitest' />
import { readFileSync } from 'node:fs';
import { resolve } from 'path';

import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
	version: string;
};

const changelog = readFileSync(resolve(import.meta.dirname, '../../CHANGELOG.md'), 'utf-8');

export default defineConfig(() => ({
	define: {
		__APP_VERSION__: JSON.stringify(version),
		__CHANGELOG__: JSON.stringify(changelog),
	},
	root: import.meta.dirname,
	cacheDir: '../../node_modules/.vite/apps/client',
	envDir: resolve(import.meta.dirname, './src/environments'),
	server: {
		port: 4200,
		host: 'localhost',
		open: true,
	},
	preview: {
		port: 4200,
		host: 'localhost',
	},
	resolve: {
		alias: {
			'@': resolve(import.meta.dirname, 'src'),
			'@svgs': resolve(import.meta.dirname, 'src/svgs'),
		},
	},
	plugins: [svgr(), react(), babel({ presets: [reactCompilerPreset()] })],
	// Uncomment this if you are using workers.
	// worker: {
	//  plugins: [],
	// },
	build: {
		outDir: './dist',
		emptyOutDir: true,
		reportCompressedSize: true,
		commonjsOptions: {
			transformMixedEsModules: true,
		},
	},
	test: {
		name: 'client',
		watch: false,
		globals: true,
		environment: 'jsdom',
		include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		reporters: ['default'],
		coverage: {
			reportsDirectory: './test-output/vitest/coverage',
			provider: 'v8' as const,
		},
	},
}));
