import Box from '@mui/material/Box';
import { getTranslations } from 'next-intl/server';
import StakeIcon from '../../components/StakeIcon';

export default async function ContentTitle({ local }: { local: Lang }) {
	const t = await getTranslations({ locale: local, namespace: 'stake' });

	return (
		<Box className="mt-4">
			<div className="text-4xl text-center font-bold bg-linear-to-r from-(--from-primary) to-(--to-primary) text-transparent bg-clip-text mb-2">
				{t('title')}
			</div>
			<Box className="text-gray-400 text-center text-xl">{t('subtitle')}</Box>

			<Box className="form-wrapper mt-8">
				<Box className="card group max-w-3xl min-h-[420px] mx-auto p-4 sm:p-8 md:p-12 bg-linear-to-br from-gray-800/80 to-gray-900/80 shadow-2xl border-primary-500/20 border-[1.5px] rounded-2xl sm:rounded-3xl">
					<Box>
						<StakeIcon />
					</Box>
					<Box className="form-label">{t('stakeAmount')}</Box>
					<Box className="form-input"></Box>
				</Box>
			</Box>
		</Box>
	);
}
