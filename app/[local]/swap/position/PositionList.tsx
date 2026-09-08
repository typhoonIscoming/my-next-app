'use client';

import Box from '@mui/material/Box';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useMemo, useRef, useState, forwardRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import useIsMobile from '@/hooks/useIsMobile';
import { cn, formatAddress, getToken } from '@/lib/utils';
import { useReadPositions } from '../hooks/useReadPositions';
import { formatEther } from 'viem';

const PAGE_SIZE = 20;

function PositionTableSkeleton() {
	const isMobile = useIsMobile();

	return (
		<div
			className="relative mt-2 w-full"
			role="status"
			aria-live="polite"
			aria-label="Loading positions"
		>
			<div className="space-y-3">
				{Array.from({ length: 8 }).map((_, index) => (
					<div key={index} className="flex items-center">
						<Skeleton className="h-10 w-48 shrink-0 rounded-none bg-white/8" />
						<Skeleton
							className={cn(
								'sh-10 shrink-0 rounded-none bg-white/8',
								isMobile ? 'w-28' : 'w-36'
							)}
						/>
						<Skeleton className="h-10 w-40 shrink-0 rounded-none bg-white/8" />
						<Skeleton className="h-10 w-40 shrink-0 rounded-none bg-white/8" />
						<Skeleton className="h-10 w-32 shrink-0 rounded-none bg-white/8" />
					</div>
				))}
			</div>
		</div>
	);
}

const PositionTableHead = forwardRef(({ onScroll }: { onScroll?: () => void }, ref) => {
	const t = useTranslations();
	const isMobile = useIsMobile();

	const syncScroll = () => {
		onScroll?.();
	};

	return (
		<Box className="sticky top-[63px] z-20">
			<Box className="overflow-hidden ">
				<Box
					ref={ref}
					onScroll={syncScroll}
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
						<Box className="w-80 font-bold shrink-0 text-right pr-8">
							{t('swap.actions')}
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
});

export default function PositionList() {
	const t = useTranslations();
	const tbodyRef = useRef<HTMLDivElement | null>(null);
	const theadRef = useRef<HTMLDivElement | null>(null);
	const isMobile = useIsMobile();
	const [currentPage, setCurrentPage] = useState(1);
	const { data, isLoading, ...rest } = useReadPositions();
	console.log('data', data);
	const rows = useMemo(() => {
		if (Array.isArray(data) && data.length)
			return data.map((item) => {
				const liquidityValue = Number(
					formatEther((item as { liquidity: bigint }).liquidity ?? 0n)
				);
				return {
					...item,
					pair: `${getToken(item.token0)} / ${getToken(item.token1)}`,
					fee: `${(item.fee / 10_000).toFixed(2)}%`,
					liquidity: liquidityValue.toFixed(2),
					range: `${item.tickLower} - ${item.tickUpper}`,
				};
			});
		return [];
	}, [data]);

	const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
	const safePage = Math.min(currentPage, totalPages);
	const start = (safePage - 1) * PAGE_SIZE;
	const end = start + PAGE_SIZE;
	const pageList = rows.slice(start, end);
	const syncScroll = (source: HTMLDivElement | null, target: HTMLDivElement | null) => {
		if (!source || !target) return;
		target.scrollLeft = source.scrollLeft;
	};
	// console.log('pageList', data, rest);
	return (
		<Box className="position-list">
			<Box className="relative">
				<PositionTableHead
					ref={theadRef}
					onScroll={() => syncScroll(theadRef.current, tbodyRef.current)}
				/>
				{isLoading ? (
					<PositionTableSkeleton />
				) : (
					<Box
						ref={tbodyRef}
						onScroll={() => syncScroll(tbodyRef.current, theadRef.current)}
						className="overflow-x-auto scrollbar-none tbody-list"
					>
						<Box className="w-fit min-w-full">
							<div className="mt-2 space-y-2">
								{pageList.map((item, index) => {
									const rowIndex = start + index + 1;
									const i = Number(item.id);
									return (
										<Box
											key={`${i}`}
											className="flex items-center border border-white/5 bg-[#050816] text-sm text-white"
										>
											{!isMobile && (
												<Box className="sticky left-0 z-9 w-12 shrink-0 border-r border-white/5 bg-[#131313] px-3 py-3 text-left text-zinc-400">
													{i}
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
												{item.tick ?? '--'}
											</Box>
											<Box className="w-80 shrink-0 text-right pr-8 font-bold">
												{item.liquidity}
											</Box>
										</Box>
									);
								})}
							</div>
						</Box>
					</Box>
				)}
				<div className="sticky z-15 bottom-0 mt-4 border-t border-white/10 bg-[#131313]/95 px-3 py-3 backdrop-blur-md">
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
							onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
							disabled={safePage === totalPages}
							className="rounded-full cursor-pointer border border-white/10 bg-white/3 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
						>
							{t('swap.next')}
						</button>
					</div>
				</div>
			</Box>
			<Box className="h-[20vh]"></Box>
		</Box>
	);
}
