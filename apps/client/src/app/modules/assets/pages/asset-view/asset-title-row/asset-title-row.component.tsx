import { AssetStatus } from '../../../models/asset.models';
import { Chip } from '@/app/shared/components/chip/chip.component';
import { ChipVariant } from '@/app/shared/models/chip.models';

import './asset-title-row.component.css';

type AssetTitleRowProps = {
	title: string;
	status: AssetStatus;
	description: string | null;
};

export function AssetTitleRow({ title, status, description }: AssetTitleRowProps) {
	return (
		<div className="asset-title-row">
			<div className="asset-title-row__group">
				<h1 className="asset-title-row__title h2">{title}</h1>
				{status === AssetStatus.READY && (
					<Chip variant={ChipVariant.OK} dot>
						ready
					</Chip>
				)}
			</div>
			{description && <p className="asset-title-row__desc">{description}</p>}
		</div>
	);
}
