import { Spinner } from '@/app/shared/components/spinner/spinner.component';

import './loader.component.css';

export function Loader() {
	return (
		<div className="loader">
			<Spinner />
		</div>
	);
}
