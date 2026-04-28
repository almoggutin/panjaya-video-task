import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CopyIcon from '@svgs/copy.svg?react';
import MoreIcon from '@svgs/more.svg?react';
import TrashIcon from '@svgs/trash.svg?react';

import type { IAsset } from '../../../../models/asset.models';
import { pushToast } from '@/app/core/slices/ui.slice';
import { ToastType } from '@/app/core/models/theme.models';
import { useAppDispatch } from '@/app/core/store/hooks';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './row-menu.component.css';

type RowMenuProps = {
	asset: IAsset;
	onDelete: () => void;
	className?: string;
};

export function RowMenu({ asset, onDelete, className }: RowMenuProps) {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();
	const [open, setOpen] = useState(false);
	const [pos, setPos] = useState({ top: 0, right: 0 });
	const triggerRef = useRef<HTMLButtonElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const handleToggle = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!open && triggerRef.current) {
			const rect = triggerRef.current.getBoundingClientRect();
			setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
		}
		setOpen((v) => !v);
	};

	useEffect(() => {
		if (!open) return;
		const close = (e: MouseEvent) => {
			if (!dropdownRef.current?.contains(e.target as Node) && !triggerRef.current?.contains(e.target as Node)) {
				setOpen(false);
			}
		};

		const closeOnScroll = () => setOpen(false);

		document.addEventListener('click', close);
		window.addEventListener('scroll', closeOnScroll, true);
		window.addEventListener('resize', closeOnScroll);

		return () => {
			document.removeEventListener('click', close);
			window.removeEventListener('scroll', closeOnScroll, true);
			window.removeEventListener('resize', closeOnScroll);
		};
	}, [open]);

	const items = [
		{
			icon: <CopyIcon width={12} height={12} />,
			label: t('assets.actions.copyId'),
			action: () => {
				setOpen(false);
				navigator.clipboard.writeText(asset.id).then(() => {
					dispatch(pushToast({ type: ToastType.SUCCESS, message: t('assets.actions.copiedId') }));
				});
			},
		},
		{
			icon: <TrashIcon width={12} height={12} />,
			label: t('assets.actions.delete'),
			action: () => {
				setOpen(false);
				onDelete();
			},
			danger: true,
		},
	];

	return (
		<div className={`row-menu${className ? ` ${className}` : ''}`}>
			<button ref={triggerRef} type="button" className="icon-btn row-menu__trigger" onClick={handleToggle}>
				<MoreIcon width={14} height={14} />
			</button>

			{open &&
				createPortal(
					<div ref={dropdownRef} className="row-menu__dropdown" style={{ top: pos.top, right: pos.right }}>
						{items.map((item, i) => (
							<button
								key={i}
								type="button"
								className={`row-menu__item ${item.danger ? 'row-menu__item--danger' : ''}`}
								onClick={(e) => {
									e.stopPropagation();
									item.action();
								}}
							>
								{item.icon}
								{item.label}
							</button>
						))}
					</div>,
					document.body
				)}
		</div>
	);
}
