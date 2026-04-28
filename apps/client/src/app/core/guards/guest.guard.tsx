import { Navigate, Outlet } from 'react-router-dom';

import { useAppSelector } from '@/app/core/store/hooks';

export function GuestGuard() {
	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

	if (isAuthenticated) return <Navigate to="/assets" replace />;
	return <Outlet />;
}
