'use client';
import { notFound } from 'next/navigation';
import Button from '@mui/material/Button';
import { useLocale, useTranslations } from 'next-intl';
import { styled } from '@mui/material';
import { useRef, useEffect, useState, use } from 'react';
import useIsMobile from '@/hooks/useIsMobile';
import { cn, formatNumber } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const WhiteButton = styled(Button)({
	color: 'white',
});

interface PoolData {
	pool: string;
	token0: string;
	token1: string;
	token0Symbol: string;
	token1Symbol: string;
	token0Decimals: number;
	token1Decimals: number;
	fee: number;
	feePercent: string;
	liquidity: string;
	sqrtPriceX96: string;
	tick: number;
	tvl: string;
	tvlUSD: number;
	volume24h: string;
	feesUSD: number;
	pair: string;
	index: number;
	token0Balance: string;
	token1Balance: string;
	apr: string;
}
interface Pagination {
	currentPage: number;
	totalPages: number;
	total: number;
	pageSize: number;
}

export default function MetaPoolPage() {
	// const locale = useLocale();
	const t = useTranslations();
	const tHeadRef = useRef<HTMLDivElement>(null);
	const tBodyRef = useRef<HTMLDivElement>(null);
	const isMobile = useIsMobile();

	const [pools, setPools] = useState<PoolData[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [totalStats, setTotalStats] = useState({
		totalPools: 0,
		totalTVL: 0,
		totalVolume24h: 0,
		totalFeesGenerated: 0,
	});
	const [pagination, setPagination] = useState<Pagination>({
		currentPage: 1,
		totalPages: 1,
		total: 0,
		pageSize: 20,
	});

	const syncScroll = (source: HTMLDivElement | null, target: HTMLDivElement | null) => {
		if (!source || !target || source === target) return;
		if (target.dataset.syncing === 'true') return;
		target.scrollLeft = source.scrollLeft;
	};

	const fetchPools = async (page = pagination.currentPage, pageSize = pagination.pageSize) => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(`/api/pools?page=${page}&limit=${pageSize}`);
			if (!response.ok) {
				throw new Error('Failed to fetch pools');
			}
			const data = await response.json();
			setPools(data.data || []);
			setPagination((prev) => ({
				...prev,
				currentPage: data.pagination?.page || page,
				totalPages: data.pagination?.totalPages || 1,
				total: data.pagination?.total || 0,
				pageSize: data.pagination?.limit || pageSize,
			}));
			setTotalStats({
				totalPools: data.pagination?.total || 0,
				totalTVL: (data.data || []).reduce(
					(acc: number, pool: PoolData) => acc + (pool.tvlUSD || 0),
					0
				),
				totalVolume24h: 0,
				totalFeesGenerated: 0,
			});
		} catch (err) {
			console.error('Error loading pools:', err);
			setError(err instanceof Error ? err.message : '加载失败');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void fetchPools(pagination.currentPage, pagination.pageSize);
	}, []);

	return (
		<div className="max-w-[1440px] m-auto px-4 py-4 sm:px-6 lg:px-8 pt-0">
			<div className="flex items-center justify-between">
				<label>{t('swap.poolTitle')}</label>
				<WhiteButton variant="contained">{t('swap.createPool')}</WhiteButton>
			</div>
			<div className="table-container relative">
				<div className="table-header sticky top-15.75 z-99">
					<div className="overflow-hidden">
						<div
							ref={tHeadRef}
							className="scroll-smooth-panel overflow-x-auto bg-[#131313] scrollbar-none thead-list"
							onScroll={() => syncScroll(tHeadRef.current, tBodyRef.current)}
						>
							<div className="flex w-fit min-w-full items-center whitespace-nowrap border-b border-white/10 text-sm text-zinc-400">
								{!isMobile && (
									<div className="sticky left-0 z-20 w-12 shrink-0 border-r border-white/10 bg-[#131313] px-3 py-3 text-left">
										#
									</div>
								)}
								<div
									className={cn(
										'font-bold shrink-0 px-3 py-3 text-left border-r border-white/10',
										isMobile ? 'sticky w-40 left-0 z-10 bg-[#131313]' : 'w-60'
									)}
								>
									{t('swap.pair')}
								</div>
								<div className="w-40 font-bold shrink-0 text-right">
									{t('swap.feeRate')}
								</div>
								<div className="w-60 font-bold shrink-0 text-right">
									{t('swap.tvl')}
								</div>
								<div className="w-40 font-bold shrink-0 text-right">
									{t('swap.apr')}
								</div>
								<div className="w-60 font-bold shrink-0 text-center grow">
									{t('swap.liquidity')}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="overflow-hidden">
					<div
						className="tBody-container scroll-smooth-panel overflow-x-auto scrollbar-none"
						ref={tBodyRef}
						onScroll={() => syncScroll(tBodyRef.current, tHeadRef.current)}
					>
						{loading ? (
							<TableSkeleton rows={pagination.pageSize} />
						) : (
							<TableList data={pools} />
						)}
					</div>
				</div>
				<TablePagenation
					currentPage={pagination.currentPage}
					totalPages={pagination.totalPages}
					onPageChange={(page) => {
						setPagination((prev) => ({ ...prev, currentPage: page }));
						void fetchPools(page, pagination.pageSize);
					}}
				/>
			</div>
		</div>
	);
}

const TableSkeleton = ({ rows = 10 }: { rows: number }) => {
	const isMobile = useIsMobile();
	const rowsArray = Array.from({ length: rows });

	return (
		<div className="w-fit min-w-full whitespace-nowrap border-b border-white/10 text-sm text-zinc-400">
			{rowsArray.map((_, index) => (
				<div key={index} className="flex items-center border-b border-white/5">
					{!isMobile && (
						<div className="sticky left-0 z-20 w-12 shrink-0 border-r border-white/10 px-3 py-3">
							<Skeleton className="h-5 w-4 rounded-sm" />
						</div>
					)}
					<div
						className={cn(
							'shrink-0 border-r border-white/10 px-3 py-3',
							isMobile ? 'w-40' : 'w-60'
						)}
					>
						<Skeleton className="h-5 w-28 rounded-sm" />
					</div>
					<div className="w-40 shrink-0 px-3 py-3 text-right">
						<Skeleton className="ml-auto h-5 w-12 rounded-sm" />
					</div>
					<div className="w-60 shrink-0 px-3 py-3 text-right">
						<Skeleton className="ml-auto h-5 w-20 rounded-sm" />
					</div>
					<div className="w-40 shrink-0 px-3 py-3 text-right">
						<Skeleton className="ml-auto h-5 w-10 rounded-sm" />
					</div>
					<div className="w-60 shrink-0 grow px-3 py-3 text-center">
						<Skeleton className="mx-auto h-5 w-24 rounded-sm" />
					</div>
				</div>
			))}
		</div>
	);
};

const TableList = ({ data }: { data: PoolData[] }) => {
	const isMobile = useIsMobile();
	return (
		<div className=" w-fit min-w-full whitespace-nowrap border-b border-white/10 text-sm text-zinc-400">
			{data.map((pool, index) => (
				<div key={pool.pool} className="flex">
					{!isMobile && (
						<div className="sticky left-0 z-20 w-12 shrink-0 border-r border-white/10 bg-[#131313] px-3 py-3 text-left">
							{index + 1}
						</div>
					)}
					<div
						className={cn(
							'flex items-center font-bold shrink-0 px-3 py-3 text-left border-r border-white/10',
							isMobile ? 'sticky w-40 left-0 z-10 bg-[#131313]' : 'w-60'
						)}
					>
						<div className="flex -space-x-2 mr-3">
							<div className="w-6 h-6 text-[13px] bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white text-xs font-bold">
								{pool.token0Symbol.charAt(0)}
							</div>
							<div className="w-6 h-6 text-[13px] bg-linear-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white text-xs font-bold z-10">
								{pool.token1Symbol.charAt(0)}
							</div>
						</div>
						<span className="text-[13px]">{pool.pair}</span>
					</div>
					<div className="w-40 flex items-center justify-end font-bold shrink-0 text-right">
						<span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
							{pool.feePercent}
						</span>
					</div>
					<div className="w-60 flex items-center justify-end font-bold shrink-0 text-right">
						{pool.tvlUSD >= 1000
							? `$${formatNumber(pool.tvlUSD)}`
							: `$${pool.tvlUSD.toFixed(2)}`}
					</div>
					<div className="w-40 flex items-center justify-end font-bold shrink-0 text-right">
						{pool.apr ?? '-'}
					</div>
					<div className="w-60 flex items-center justify-center font-bold shrink-0 text-right grow">
						{formatNumber(parseFloat(pool.liquidity))}
					</div>
				</div>
			))}
		</div>
	);
};

const TablePagenation = ({
	currentPage,
	totalPages,
	onPageChange,
}: {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}) => {
	const t = useTranslations();
	return (
		<div className="sticky bottom-0 z-30 mt-4 border-t border-white/10 bg-[#131313]/95 px-3 py-3 backdrop-blur-md">
			<div className="flex items-center justify-end gap-2 text-sm text-zinc-300">
				<button
					type="button"
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
					className="rounded-full cursor-pointer border border-white/10 bg-white/3 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
				>
					{t('swap.prev')}
				</button>
				<span className="min-w-16 text-center">
					{currentPage}/{totalPages}
				</span>
				<button
					type="button"
					onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
					className="rounded-full cursor-pointer border border-white/10 bg-white/3 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
				>
					{t('swap.next')}
				</button>
			</div>
		</div>
	);
};
