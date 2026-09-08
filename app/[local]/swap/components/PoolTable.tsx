'use client';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { useReadPool } from '../hooks/useReadPool';
import { getToken, cn } from '@/lib/utils';
import { formatEther, formatUnits } from 'viem';
import useIsMobile from '@/hooks/useIsMobile';
import TableSkeleton from './TableSkeleton';

const PAGE_SIZE = 20;

export function PoolTable() {
	const t = useTranslations();
	const theadRef = useRef<HTMLDivElement | null>(null);
	const tbodyRef = useRef<HTMLDivElement | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const isMobile = useIsMobile();
	const poolData = useReadPool();
	const isLoading = Boolean(poolData?.isLoading);
	/**
     * fee: 500
        feeProtocol: 0
        index: 0
        liquidity: 0n
        pool: "0x20418c73194540Dbc96ec2296F120042781Ef35D"
        sqrtPriceX96: 792281625142643375935439503n
        tick: -92109
        tickLower: -887220
        tickUpper: 887220
        token0: "0x5A4eA3a013D42Cfd1B1609d19f6eA998EeE06D30"
        token1: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14"
    */
	const poolRows = useMemo(() => {
		const raw = Array.isArray(poolData?.data) ? poolData.data.reverse() : [];
		const txHash = '0xb6a16a821aae7c11c814eb858349e3a2cf97d87e864021262df3c04b97bc85f6';
		const pool = '0xD9D32d8173AA010E16E5F5aB6644E6027129F1b4';
		const createItem = raw.find((item) => item.pool === pool);
		console.log('createItem', raw, createItem);
		return raw.map((item, index) => {
			if (typeof item === 'object' && item !== null && 'token0' in item && 'token1' in item) {
				const fee = Number((item as { fee?: bigint | number }).fee ?? 0);
				const liquidityValue = Number(
					formatEther((item as { liquidity: bigint }).liquidity ?? 0n)
				);
				const sqrtPriceX96 = (item as { sqrtPriceX96?: bigint }).sqrtPriceX96 ?? 0n;
				const Q96 = 2n ** 96n;
				const price = (sqrtPriceX96 * sqrtPriceX96) / (Q96 * Q96);
				return {
					pair: `${getToken((item as { token0: `0x${string}` }).token0)} / ${getToken((item as { token1: `0x${string}` }).token1)}`,
					fee: `${(fee / 10_000).toFixed(2)}%`,
					tick: item.tick,
					currentPrice: Number(price).toFixed(2),
					index: index + 1,
					range:
						item.tickLower && item.tickUpper
							? `${item.tickLower} - ${item.tickUpper}`
							: '--',
					liquidity: liquidityValue.toFixed(2),
				};
			}
			return {
				...item,
				index: index + 1,
			};
		});
	}, [poolData]);

	// console.log('poolRows:', poolData, poolRows);

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
								{!isMobile && (
									<Box className="sticky  left-0 z-20 w-12 shrink-0 border-r border-white/10 bg-[#131313] px-3 py-3 text-left">
										#
									</Box>
								)}

								<Box
									className={cn(
										'font-bold shrink-0 px-3 py-3 text-left border-r border-white/10',
										isMobile ? 'sticky w-40 left-0 z-10 bg-[#131313]' : 'w-60'
									)}
								>
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
								<Box className="w-40 font-bold shrink-0 text-right pr-8">
									{t('swap.liquidity')}
								</Box>
							</Box>
						</Box>
					</Box>
				</Box>
				{isLoading ? (
					<TableSkeleton />
				) : poolRows.length ? (
					<>
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
											className="flex items-center  border border-white/5 bg-[#050816] text-sm text-white"
										>
											{!isMobile && (
												<Box className="sticky left-0 z-10 w-12 shrink-0 border-r border-white/5 bg-[#131313] px-3 py-3 text-left text-zinc-400">
													{item.index}
												</Box>
											)}
											<Box
												className={cn(
													'shrink-0 px-3 py-3 text-left font-bold border-r border-white/10',
													isMobile
														? 'sticky left-0 w-40 z-10 bg-[#050816]'
														: 'w-60'
												)}
											>
												{item.pair}
											</Box>
											<Box className="w-40 shrink-0 text-right font-bold">
												{item.fee}
											</Box>
											<Box className="w-40 shrink-0 grow text-right font-bold">
												{item.range}
											</Box>
											<Box className="w-40 shrink-0 text-right font-bold">
												{item.currentPrice ?? '--'}
											</Box>
											<Box className="w-40 shrink-0 text-right pr-8 font-bold">
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
									className="rounded-full cursor-pointer border border-white/10 bg-white/3 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
								>
									{t('swap.prev')}
								</button>
								<span className="min-w-16 text-center">
									{safePage}/{totalPages}
								</span>
								<button
									type="button"
									onClick={() =>
										setCurrentPage((prev) => Math.min(totalPages, prev + 1))
									}
									disabled={safePage === totalPages}
									className="rounded-full cursor-pointer border border-white/10 bg-white/3 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
								>
									{t('swap.next')}
								</button>
							</div>
						</div>
					</>
				) : (
					<div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/2 px-6 py-12 text-center text-zinc-400">
						<div className="text-lg font-medium text-white">{t('swap.emptyList')}</div>
						<p className="mt-2 text-sm text-zinc-400">{t('swap.noPools')}</p>
					</div>
				)}
			</div>
			{/* <Box className="h-500" /> */}
		</div>
	);
}
