import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { AssetListEmpty } from './asset-list-empty/asset-list-empty.component';
import { AssetListError } from './asset-list-error/asset-list-error.component';
import { AssetListNoResults } from './asset-list-no-results/asset-list-no-results.component';
import { AssetListHeader } from './asset-list-header/asset-list-header.component';
import { AssetTable } from './asset-table/asset-table.component';
import { useAssets } from '../../hooks/asset-list.hook';
import { SortDir, SortKey } from '../../models/asset-table.models';
import { TablePagination } from '@/app/shared/components/table/table-pagination/table-pagination.component';
import { Loader } from '@/app/shared/components/loader/loader.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';
import type { IAsset } from '../../models/asset.models';

import './asset-list.component.css';

export function AssetList() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const [search, setSearch] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [page, setPage] = useState(1);

	const sortKey: SortKey = (searchParams.get('sort') as SortKey) ?? SortKey.CREATED_AT;
	const sortDir: SortDir = (searchParams.get('dir') as SortDir) ?? SortDir.DESC;

	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearch(search), 500);
		return () => clearTimeout(id);
	}, [search]);

	const { data, isLoading, isError } = useAssets({ page, sortKey, sortDir, search: debouncedSearch });

	const items: IAsset[] = data?.items ?? [];
	const total: number = data?.total ?? 0;
	const limit: number = data?.limit ?? 0;
	const totalPages: number = data?.totalPages ?? 1;
	const clampedPage = Math.min(page, totalPages);
	const showingStart = total === 0 ? 0 : (clampedPage - 1) * limit + 1;
	const showingEnd = Math.min(clampedPage * limit, total);

	const handleSort = (key: SortKey) => {
		setPage(1);
		const newDir: SortDir = sortKey === key && sortDir === SortDir.DESC ? SortDir.ASC : SortDir.DESC;
		setSearchParams({ sort: key, dir: newDir });
	};

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPage(1);
		setSearch(e.target.value);
	};

	if (isLoading) return <Loader />;
	if (isError) return <AssetListError />;

	const isEmpty: boolean = total === 0 && !search;
	const isNoResults: boolean = total === 0 && !!search;

	return (
		<div className="page asset-list-page">
			<div className="container-wide asset-list__page-container">
				{isEmpty ? (
					<AssetListEmpty onUpload={() => navigate('/assets/upload')} />
				) : (
					<>
						<AssetListHeader
							search={search}
							onSearch={handleSearch}
							onUpload={() => navigate('/assets/upload')}
						/>

						<div className="panel asset-list__panel">
							{isNoResults ? (
								<AssetListNoResults />
							) : (
								<>
									<div className="asset-list__table-wrap">
										<AssetTable assets={items} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
									</div>
									{total > 0 && (
										<TablePagination
											page={clampedPage}
											totalPages={totalPages}
											onPageChange={setPage}
											info={t('assets.list.page.showing', {
												start: showingStart,
												end: showingEnd,
												total,
											})}
											prevLabel={t('assets.list.page.prev')}
											nextLabel={t('assets.list.page.next')}
											className="asset-list__pagination"
										/>
									)}
								</>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
