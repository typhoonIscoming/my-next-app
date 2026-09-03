'use client';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';

const list = [
	{ pair: 'ETH / USDC', fee: '0.05%', tvl: '$63.4M', apr: '3.92%' },
	{ pair: 'WBTC / ETH', fee: '0.30%', tvl: '$41.1M', apr: '2.71%' },
	{ pair: 'USDC / USDT', fee: '0.01%', tvl: '$17.9M', apr: '4.36%' },
];

export function PoolTable() {
	const t = useTranslations();

	return (
		<div className="w-full">
			<div className="min-w-[860px]">
				<Box className="sticky top-[63px] z-20 bg-[#131313]">
					<Box className="flex items-center border-b border-white/10 px-3 py-3 text-sm text-zinc-400">
						<Box className="w-16 shrink-0 text-left">#</Box>
						<Box className="w-60 shrink-0 text-left">{t('swap.poolTitle')}</Box>
						<Box className="w-40 shrink-0 text-right">{t('swap.totalLockedValue')}</Box>
						<Box className="w-40 shrink-0 text-right">{t('swap.dayVolume')}</Box>
						<Box className="w-40 shrink-0 text-right">{t('swap.day30Volume')}</Box>
						<Box className="w-40 shrink-0 text-right">{t('swap.dayVolumeOverTvl')}</Box>
						<Box className="w-40 shrink-0 text-right">{t('swap.poolApr')}</Box>
					</Box>
				</Box>

				<div className="mt-2 space-y-2">
					{list.map((item, index) => (
						<Box
							key={item.pair}
							className="flex items-center rounded-2xl border border-white/5 bg-white/2 px-3 py-3 text-sm text-white"
						>
							<Box className="w-16 shrink-0 text-left text-zinc-400">{index + 1}</Box>
							<Box className="w-60 shrink-0 text-left font-medium">{item.pair}</Box>
							<Box className="w-40 shrink-0 text-right">{item.tvl}</Box>
							<Box className="w-40 shrink-0 text-right">{item.fee}</Box>
							<Box className="w-40 shrink-0 text-right">{'--'}</Box>
							<Box className="w-40 shrink-0 text-right">{'--'}</Box>
							<Box className="w-40 shrink-0 text-right text-emerald-400">
								{item.apr}
							</Box>
						</Box>
					))}
				</div>
			</div>
			<Box className="h-500" />
		</div>
	);
}
