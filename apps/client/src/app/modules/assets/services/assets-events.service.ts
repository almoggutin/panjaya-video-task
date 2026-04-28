import { store } from '@/app/core/store/store';
import { env } from '@/app/core/utils/env.utils';
import { ErrorEventDataSchema, ReadyEventDataSchema, StatusEventDataSchema } from '../schemas/asset-event.schema';
import type { UserAssetEventCallback } from '../models/asset-event.models';

export function subscribeToUserEvents(onEvent: UserAssetEventCallback): () => void {
	const token = store.getState().auth.accessToken;
	if (!token) return () => {};

	const url = new URL('/assets/events', env.VITE_API_URL);
	url.searchParams.set('access_token', token);

	const es = new EventSource(url.toString());

	es.addEventListener('status', (e: MessageEvent) => {
		const result = StatusEventDataSchema.safeParse(JSON.parse(e.data));
		if (result.success) onEvent({ type: 'status', data: result.data });
	});

	es.addEventListener('ready', (e: MessageEvent) => {
		const result = ReadyEventDataSchema.safeParse(JSON.parse(e.data));
		if (result.success) onEvent({ type: 'ready', data: result.data });
	});

	es.addEventListener('error', (e: Event) => {
		if (e instanceof MessageEvent && e.data) {
			const result = ErrorEventDataSchema.safeParse(JSON.parse(e.data));
			if (result.success) onEvent({ type: 'error', data: result.data });
		} else {
			es.close();
		}
	});

	return () => es.close();
}
