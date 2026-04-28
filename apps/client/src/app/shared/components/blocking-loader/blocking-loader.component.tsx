import { useAppSelector } from '@/app/core/store/hooks';
import { Spinner } from '@/app/shared/components/spinner/spinner.component';

import './blocking-loader.component.css';

export function BlockingLoader() {
	const isLoading = useAppSelector((state) => state.ui.blockingLoader);
	if (!isLoading) return null;

	return (
		<div className="blocking-loader">
			<Spinner />
		</div>
	);
}
