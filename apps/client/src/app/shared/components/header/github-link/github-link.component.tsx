import GithubIcon from '@svgs/github.svg?react';

import { env } from '@/app/core/utils/env.utils';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

import './github-link.component.css';

export function GithubLink() {
	const { t } = useTranslation();

	return (
		<a
			className="icon-btn"
			href={env.VITE_GITHUB_URL}
			target="_blank"
			rel="noopener noreferrer"
			title={t('shell.header.github')}
		>
			<GithubIcon width={15} height={15} />
		</a>
	);
}
