'use client';
import { notFound } from 'next/navigation';
import Button from '@mui/material/Button';
import { useLocale, useTranslations } from 'next-intl';
import { styled } from '@mui/material';
import { useRef, useEffect, useState } from 'react';
import useIsMobile from '@/hooks/useIsMobile';
import { cn, formatNumber } from '@/lib/utils';

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

	const syncScroll = (source: HTMLDivElement | null, target: HTMLDivElement | null) => {
		if (!source || !target || source === target) return;
		if (target.dataset.syncing === 'true') return;
		target.scrollLeft = source.scrollLeft;
	};

	const fetchPools = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch('/api/pools');
			if (!response.ok) {
				throw new Error('Failed to fetch pools');
			}
			const data = await response.json();
			setPools(data.data);
			console.log('data', data);
			setTotalStats({
				totalPools: data.pagination.total || 0,
				totalTVL: data.data.reduce((acc: number, pool: PoolData) => acc + pool.tvlUSD, 0),
				totalVolume24h: 0, // Placeholder
				totalFeesGenerated: 0, // Placeholder
			});
		} catch (err) {
			console.error('Error loading pools:', err);
			setError(err instanceof Error ? err.message : '加载失败');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPools();
	}, []);

	return (
		<div className="min-h-[150vh] p-4 pt-0">
			<div className="flex items-center justify-between">
				<label>{t('swap.poolTitle')}</label>
				<WhiteButton>{t('swap.createPool')}</WhiteButton>
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
								<div className="w-40 font-bold shrink-0 grow text-right">
									{t('swap.tvl')}
								</div>
								<div className="w-40 font-bold shrink-0 text-right">
									{t('swap.apr')}
								</div>
								<div className="w-40 font-bold shrink-0 text-right pr-8">
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
						<TableList data={pools} />
					</div>
				</div>
			</div>
		</div>
	);
}

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
							'font-bold shrink-0 px-3 py-3 text-left border-r border-white/10',
							isMobile ? 'sticky w-40 left-0 z-10 bg-[#131313]' : 'w-60'
						)}
					>
						{pool.pair}
					</div>
					<div className="w-40 font-bold shrink-0 text-right">
						<span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
							{pool.feePercent}
						</span>
					</div>
					<div className="w-40 font-bold shrink-0 grow text-right">
						{pool.tvlUSD >= 1000
							? `$${formatNumber(pool.tvlUSD)}`
							: `$${pool.tvlUSD.toFixed(2)}`}
					</div>
					<div className="w-40 font-bold shrink-0 text-right">{pool.apr ?? '-'}</div>
					<div className="w-40 font-bold shrink-0 text-right pr-8">
						{formatNumber(parseFloat(pool.liquidity))}
					</div>
				</div>
			))}
		</div>
	);
};
