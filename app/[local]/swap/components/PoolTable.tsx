'use client';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { useReadPool } from '../hooks/useReadPool';
import { getToken } from '@/lib/utils';
import { formatEther } from 'viem';

const list = [
	{ pair: 'ETH / USDC', fee: '0.05%', tvl: '$63.4M', apr: '3.92%' },
	{ pair: 'WBTC / ETH', fee: '0.30%', tvl: '$41.1M', apr: '2.71%' },
	{ pair: 'USDC / USDT', fee: '0.01%', tvl: '$17.9M', apr: '4.36%' },
];

const PAGE_SIZE = 20;

export function PoolTable() {
	const t = useTranslations();
	const theadRef = useRef<HTMLDivElement | null>(null);
	const tbodyRef = useRef<HTMLDivElement | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const poolData = useReadPool();

	const poolRows = useMemo(() => {
		const raw = Array.isArray(poolData?.data) ? poolData.data : list;
		return raw.map((item, index) => {
			if (typeof item === 'object' && item !== null && 'token0' in item && 'token1' in item) {
				const fee = Number((item as { fee?: bigint | number }).fee ?? 0);
				const liquidityValue = Number(
					formatEther((item as { liquidity: bigint }).liquidity ?? 0n)
				);
				return {
					pair: `${getToken((item as { token0: `0x${string}` }).token0)} / ${getToken((item as { token1: `0x${string}` }).token1)}`,
					fee: `${(fee / 10_000).toFixed(2)}%`,
					tvl: '--',
					apr: '--',
					index: index + 1,
					liquidity: liquidityValue.toFixed(2),
				};
			}
			return {
				...item,
				index: index + 1,
			};
		});
	}, [poolData]);

	console.log('poolRows:', poolData, poolRows);

	const totalPages = Math.max(1, Math.ceil(poolRows.length / PAGE_SIZE));
	const safePage = Math.min(currentPage, totalPages);
	const start = (safePage - 1) * PAGE_SIZE;
	const end = start + PAGE_SIZE;
	const pageList = poolRows.slice(start, end);

	const syncScroll = (source: HTMLDivElement | null, target: HTMLDivElement | null) => {
		if (!source || !target) return;
		target.scrollLeft = source.scrollLeft;
	};

	return (
		<div className="relative w-full">
			<div>
				<Box className="sticky top-[63px] z-20">
					<Box className="overflow-hidden ">
						<Box
							ref={theadRef}
							onScroll={() => syncScroll(theadRef.current, tbodyRef.current)}
							className="overflow-x-auto bg-[#131313] scrollbar-none thead-list"
						>
							<Box className="flex w-fit min-w-full items-center whitespace-nowrap border-b border-white/10 text-sm text-zinc-400">
								<Box className="sticky  left-0 z-20 w-12 shrink-0 border-r border-white/10 bg-[#131313] px-3 py-3 text-left">
									#
								</Box>
								<Box className="w-60 font-bold shrink-0 px-3 text-left border-r border-white/10">
									{t('swap.poolTitle')}
								</Box>
								<Box className="w-40 font-bold shrink-0 text-right">
									{t('swap.feeRate')}
								</Box>
								<Box className="w-40 font-bold shrink-0 grow text-right">
									{t('swap.priceRange')}
								</Box>
								<Box className="w-40 font-bold shrink-0 text-right">
									{t('swap.currentPrice')}
								</Box>
								<Box className="w-80 font-bold shrink-0 text-right pr-8">
									{t('swap.liquidity')}
								</Box>
							</Box>
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
							{pageList.map((item) => (
								<Box
									key={`${item.pair}-${item.index}`}
									className="flex items-center  border border-white/5 bg-white/2 text-sm text-white"
								>
									<Box className="sticky left-0 z-10 w-12 shrink-0 border-r border-white/5 bg-[#131313] px-3 py-3 text-left text-zinc-400">
										{item.index}
									</Box>
									<Box className="w-60 shrink-0 px-3 text-left font-bold border-r border-white/10">
										{item.pair}
									</Box>
									<Box className="w-40 shrink-0 text-right font-bold">
										{item.fee}
									</Box>
									<Box className="w-40 shrink-0 grow text-right font-bold">
										{item.liquidity}
									</Box>
									<Box className="w-40 shrink-0 text-right font-bold">{'--'}</Box>
									<Box className="w-80 shrink-0 text-right pr-8 font-bold">
										{item.liquidity}
									</Box>
								</Box>
							))}
						</div>
					</Box>
				</Box>
				<div className="sticky  bottom-0 z-30 mt-4 border-t border-white/10 bg-[#131313]/95 px-3 py-3 backdrop-blur-md">
					<div className="flex items-center justify-end gap-2 text-sm text-zinc-300">
						<button
							type="button"
							onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
							disabled={safePage === 1}
							className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
						>
							{t('swap.prev')}
						</button>
						<span className="min-w-16 text-center">
							{safePage}/{totalPages}
						</span>
						<button
							type="button"
							onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
							disabled={safePage === totalPages}
							className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
						>
							{t('swap.next')}
						</button>
					</div>
				</div>
			</div>
			{/* <Box className="h-500" /> */}
		</div>
	);
}
