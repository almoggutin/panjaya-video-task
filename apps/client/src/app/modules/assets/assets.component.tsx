import { Outlet } from 'react-router-dom';

import './assets.component.css';

export function Assets() {
	return (
		<div className="assets">
			<Outlet />
		</div>
	);
}
