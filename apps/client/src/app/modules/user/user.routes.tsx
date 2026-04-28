import type { RouteObject } from 'react-router-dom';

import { User } from './user.component';
import { Profile } from './pages/profile/profile.component';

export const userRoutes: RouteObject = {
	element: <User />,
	children: [{ index: true, element: <Profile /> }],
};
