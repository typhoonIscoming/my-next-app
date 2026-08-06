import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export default async function ContentTitle({ local }: { local: Lang }) {
	const t = await getTranslations({ locale: local, namespace: 'stake' });
	return (
		<Box className="mt-4">
			<div className="text-4xl text-center font-bold bg-linear-to-r from-(--from-primary) to-(--to-primary) text-transparent bg-clip-text mb-2">
				{t('title')}
			</div>
			<Box className="text-gray-400 text-center text-xl">{t('subtitle')}</Box>
		</Box>
	);
}
