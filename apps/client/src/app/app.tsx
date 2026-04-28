import { QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';

import { store } from '@/app/core/store/store';
import { queryClient } from '@/app/core/utils/query-client.utils';
import { assetsRoutes } from '@/app/modules/assets/assets.routes';
import { authRoutes } from '@/app/modules/auth/auth.routes';
import { Changelog } from '@/app/modules/changelog/changelog.component';
import { Landing } from '@/app/modules/landing/landing.component';
import { NotFound } from '@/app/modules/not-found/not-found.component';
import { userRoutes } from '@/app/modules/user/user.routes';
import { BlockingLoader } from '@/app/shared/components/blocking-loader/blocking-loader.component';
import { Footer } from '@/app/shared/components/footer/footer.component';
import { Header } from '@/app/shared/components/header/header.component';
import { ErrorBoundary } from '@/app/shared/components/error-boundary/error-boundary.component';
import { Loader } from '@/app/shared/components/loader/loader.component';
import { AuthGuard } from '@/app/core/guards/auth.guard';
import { GuestGuard } from '@/app/core/guards/guest.guard';
import { DialogProvider } from '@/app/shared/components/dialog/dialog.context';
import { ToastContainer } from '@/app/shared/components/toast/toast.component';

import './app.css';

function AppShell() {
	return (
		<DialogProvider>
			<Header />

			<main className="app__main">
				<Outlet />
			</main>

			<Footer />
			<ToastContainer />
			<BlockingLoader />
		</DialogProvider>
	);
}

const router = createBrowserRouter([
	{
		element: <AppShell />,
		errorElement: (
			<ErrorBoundary>
				<div />
			</ErrorBoundary>
		),
		children: [
			{ index: true, element: <Landing /> },
			{ path: 'changelog', element: <Changelog /> },
			{ path: 'auth', element: <GuestGuard />, children: [authRoutes] },
			{
				element: <AuthGuard />,
				children: [
					{ path: 'assets', ...assetsRoutes },
					{ path: 'profile', ...userRoutes },
				],
			},
			{ path: '*', element: <NotFound /> },
		],
	},
]);

export function App() {
	return (
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<Suspense fallback={<Loader />}>
					<RouterProvider router={router} />
				</Suspense>
			</QueryClientProvider>
		</Provider>
	);
}
