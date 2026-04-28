import { Navigate, Outlet } from 'react-router-dom';

import { useAppSelector } from '@/app/core/store/hooks';
import { useUserAssetEvents } from '@/app/modules/assets/hooks/user-asset-events.hook';

export function AuthGuard() {
	const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
	useUserAssetEvents();

	if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
	return <Outlet />;
}
