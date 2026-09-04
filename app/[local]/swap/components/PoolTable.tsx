'use client';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';

const list = [
	{ pair: 'ETH / USDC', fee: '0.05%', tvl: '$63.4M', apr: '3.92%' },
	{ pair: 'WBTC / ETH', fee: '0.30%', tvl: '$41.1M', apr: '2.71%' },
	{ pair: 'USDC / USDT', fee: '0.01%', tvl: '$17.9M', apr: '4.36%' },
];

export function PoolTable() {
	const t = useTranslations();
	const theadRef = useRef<HTMLDivElement | null>(null);
	const tbodyRef = useRef<HTMLDivElement | null>(null);

	const syncScroll = (source: HTMLDivElement | null, target: HTMLDivElement | null) => {
		if (!source || !target) return;
		target.scrollLeft = source.scrollLeft;
	};

	return (
		<div className="w-full">
			<div>
				<Box className="sticky top-[63px] z-20 bg-[#131313]">
					<Box
						ref={theadRef}
						onScroll={() => syncScroll(theadRef.current, tbodyRef.current)}
						className="overflow-x-auto overflow-y-hidden scrollbar-none thead-list"
					>
						<Box className="flex w-fit min-w-full items-center whitespace-nowrap border-b border-white/10 text-sm text-zinc-400">
							<Box className="sticky left-0 z-20 w-16 shrink-0 border-r border-white/10 bg-[#131313] px-3 py-3 text-left">
								#
							</Box>
							<Box className="w-60 shrink-0 px-3 text-left">
								{t('swap.poolTitle')}
							</Box>
							<Box className="w-40 shrink-0 text-right">
								{t('swap.totalLockedValue')}
							</Box>
							<Box className="w-40 shrink-0 text-right">{t('swap.dayVolume')}</Box>
							<Box className="w-40 shrink-0 text-right">{t('swap.day30Volume')}</Box>
							<Box className="w-40 shrink-0 text-right">
								{t('swap.dayVolumeOverTvl')}
							</Box>
							<Box className="w-40 shrink-0 pr-8 text-right">{t('swap.poolApr')}</Box>
						</Box>
					</Box>
				</Box>
				<Box
					ref={tbodyRef}
					onScroll={() => syncScroll(tbodyRef.current, theadRef.current)}
					className="overflow-x-auto overflow-y-hidden scrollbar-none tbody-list"
				>
					<Box className="w-fit min-w-full">
						<div className="mt-2 space-y-2">
							{list.map((item, index) => (
								<Box
									key={item.pair}
									className="flex items-center rounded-2xl border border-white/5 bg-white/2 text-sm text-white"
								>
									<Box className="sticky left-0 z-10 w-16 shrink-0 border-r border-white/5 bg-[#131313] px-3 py-3 text-left text-zinc-400">
										{index + 1}
									</Box>
									<Box className="w-60 shrink-0 px-3 text-left font-medium">
										{item.pair}
									</Box>
									<Box className="w-40 shrink-0 text-right">{item.tvl}</Box>
									<Box className="w-40 shrink-0 text-right">{item.fee}</Box>
									<Box className="w-40 shrink-0 text-right">{'--'}</Box>
									<Box className="w-40 shrink-0 text-right">{'--'}</Box>
									<Box className="w-40 shrink-0 pr-8 text-right text-emerald-400">
										{item.apr}
									</Box>
								</Box>
							))}
						</div>
					</Box>
				</Box>
			</div>
			<Box className="h-500" />
		</div>
	);
}
