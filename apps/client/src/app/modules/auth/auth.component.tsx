import { Outlet } from 'react-router-dom';

import { AuthCard } from './components/auth-card/auth-card.component';
import { useAuthHandle } from './hooks/use-auth-handle.hook';

import './auth.component.css';

export function Auth() {
	const { title, subtitle } = useAuthHandle();

	return (
		<AuthCard title={title} subtitle={subtitle}>
			<Outlet />
		</AuthCard>
	);
}
