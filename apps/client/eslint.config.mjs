import nx from '@nx/eslint-plugin';
import reactCompiler from 'eslint-plugin-react-compiler';
import importPlugin from 'eslint-plugin-import';
import baseConfig from '../../eslint.config.mjs';

export default [
	...nx.configs['flat/react'],
	...baseConfig,
	{
		plugins: {
			'react-compiler': reactCompiler,
			import: importPlugin,
		},
	},
	{
		files: ['**/*.ts', '**/*.tsx'],
		rules: {
			// React Compiler — flag patterns that break automatic memoization
			'react-compiler/react-compiler': 'error',

			// React best practices
			'react/prop-types': 'off', // TypeScript handles this
			'react/react-in-jsx-scope': 'off', // React 17+ JSX transform
			'react/display-name': 'warn',
			'react/no-unused-prop-types': 'warn',
			'react/self-closing-comp': 'warn',
			'react/jsx-no-useless-fragment': 'warn',
			'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],

			// React Hooks
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',

			// TypeScript best practices
			'@typescript-eslint/no-inferrable-types': 'off',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
			'@typescript-eslint/no-non-null-assertion': 'warn',

			'import/no-duplicates': 'error',

			// General
			'no-console': ['warn', { allow: ['warn', 'error'] }],
			'prefer-const': 'error',
			'no-var': 'error',
		},
	},
	{
		files: ['**/*.js', '**/*.jsx'],
		rules: {
			'react/react-in-jsx-scope': 'off',
		},
	},
];
