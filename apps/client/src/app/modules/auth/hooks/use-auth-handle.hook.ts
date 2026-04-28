import { useMatches } from 'react-router-dom';

import type { IAuthHandle } from '../models/auth.models';

export function useAuthHandle(): Partial<IAuthHandle> {
	const matches = useMatches();
	return (matches.at(-1)?.handle ?? {}) as Partial<IAuthHandle>;
}
