import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import { App } from './app/app';

import { store } from '@/app/core/store/store';
import { initializeI18n } from '@/app/core/utils/i18n.utils';

document.documentElement.setAttribute('data-theme', store.getState().ui.theme);

initializeI18n().then(() => {
	const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

	root.render(
		<StrictMode>
			<App />
		</StrictMode>
	);
});
