import { ErrorDisplay } from '@/app/shared/components/error-display/error-display.component';
import { useTranslation } from '@/app/shared/hooks/i18n.hook';

export function AssetListError() {
	const { t } = useTranslation();

	return <ErrorDisplay message={t('assets.list.error')} />;
}
