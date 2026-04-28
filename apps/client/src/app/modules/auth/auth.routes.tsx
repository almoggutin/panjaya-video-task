import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import { Auth } from './auth.component';
import { Login } from './pages/login/login.component';
import { Signup } from './pages/signup/signup.component';

export const authRoutes: RouteObject = {
	element: <Auth />,
	children: [
		{ index: true, element: <Navigate to="/auth/login" replace /> },
		{
			path: 'login',
			handle: { title: 'auth.login.title', subtitle: 'auth.login.subtitle' },
			element: <Login />,
		},
		{
			path: 'signup',
			handle: { title: 'auth.signup.title', subtitle: 'auth.signup.subtitle' },
			element: <Signup />,
		},
	],
};
