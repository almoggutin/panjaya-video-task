import type { RouteObject } from 'react-router-dom';

import { Assets } from './assets.component';
import { AssetList } from './pages/asset-list/asset-list.component';
import { AssetUpload } from './pages/asset-upload/asset-upload.component';
import { AssetView } from './pages/asset-view/asset-view.component';
import { AssetGuard } from './guards/asset.guard';

export const assetsRoutes: RouteObject = {
	element: <Assets />,
	children: [
		{ index: true, element: <AssetList /> },
		{ path: 'upload', element: <AssetUpload /> },
		{
			path: ':id',
			element: <AssetGuard />,
			children: [{ index: true, element: <AssetView /> }],
		},
	],
};
