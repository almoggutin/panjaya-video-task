import { Outlet } from 'react-router-dom';

import './user.component.css';

export function User() {
	return (
		<div className="user">
			<Outlet />
		</div>
	);
}
