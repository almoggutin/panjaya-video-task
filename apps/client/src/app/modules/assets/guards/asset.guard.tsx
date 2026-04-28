import { Navigate, Outlet, useParams } from 'react-router-dom';

import { AssetStatus } from '../models/asset.models';
import { useAsset } from '../hooks/asset-detail.hook';
import { Loader } from '@/app/shared/components/loader/loader.component';

export function AssetGuard() {
	const { id } = useParams() as { id: string };
	const { data: asset, isLoading } = useAsset(id);

	if (isLoading) return <Loader />;
	if (!asset || asset.status !== AssetStatus.READY) return <Navigate to="/assets" replace />;

	return <Outlet />;
}
