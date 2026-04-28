import { SORTABLE_COLUMNS } from '../../../constants/asset-table.constants';
import { SortDir, type SortKey } from '../../../models/asset-table.models';
import type { IAsset } from '../../../models/asset.models';
import { AssetTableRow } from './asset-table-row/asset-table-row.component';
import { Table } from '@/app/shared/components/table/table.component';
import type { ITableColumn } from '@/app/shared/models/table.models';
import { TableSortDir } from '@/app/shared/models/table.models';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './asset-table.component.css';

type AssetTableProps = {
	assets: IAsset[];
	sortKey: SortKey;
	sortDir: SortDir;
	onSort: (key: SortKey) => void;
};

export function AssetTable({ assets, sortKey, sortDir, onSort }: AssetTableProps) {
	const { t } = useTranslation();

	const columns: ITableColumn[] = [
		{ key: 'thumbnail', header: t('assets.list.columns.thumbnail') },
		...SORTABLE_COLUMNS.map(({ key, labelKey }) => ({
			key,
			header: t(labelKey),
			sortable: true,
			sortDir: sortKey === key ? (sortDir === SortDir.ASC ? TableSortDir.ASC : TableSortDir.DESC) : undefined,
			onSort: () => onSort(key),
		})),
		{ key: 'status', header: t('assets.list.columns.status') },
		{ key: 'actions', header: t('assets.list.columns.actions') },
	];

	return (
		<Table columns={columns} className="asset-table">
			{assets.map((asset) => (
				<AssetTableRow key={asset.id} asset={asset} />
			))}
		</Table>
	);
}
