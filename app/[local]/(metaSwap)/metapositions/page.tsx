'use client';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Loader2, Droplets, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { usePositions } from '@/hooks/usePositions';
import { formatNumber } from '@/lib/utils';

export default function PositionsPage() {
	const t = useTranslations();
	const { positions, loading, error, stats, refetch } = usePositions();
	const { isConnected } = useAccount();
	return (
		<div className="max-w-[1440px] m-auto px-4 py-4 sm:px-6 lg:px-8 pt-0">
			<h1 className="text-2xl">{t('swap.myPositions')}</h1>
			<h2 className="text-zinc-400 mt-2 mb-8">{t('swap.positionSlogan')}</h2>
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
				<div className="bg-white p-6 rounded-lg border">
					<div className="text-2xl font-bold text-gray-900">
						{loading ? (
							<div className="flex items-center">
								<Loader2 className="h-5 w-5 animate-spin mr-2" />-
							</div>
						) : (
							stats.activePositions
						)}
					</div>
					<div className="text-sm text-gray-600">活跃头寸</div>
				</div>
				<div className="bg-white p-6 rounded-lg border">
					<div className="text-2xl font-bold text-gray-900">
						{loading ? (
							<div className="flex items-center">
								<Loader2 className="h-5 w-5 animate-spin mr-2" />-
							</div>
						) : (
							formatNumber(stats.totalValue)
						)}
					</div>
					<div className="text-sm text-gray-600">总价值</div>
				</div>
				<div className="bg-white p-6 rounded-lg border">
					<div className="text-2xl font-bold text-gray-900">
						{loading ? (
							<div className="flex items-center">
								<Loader2 className="h-5 w-5 animate-spin mr-2" />-
							</div>
						) : (
							formatNumber(stats.totalUnclaimedFees)
						)}
					</div>
					<div className="text-sm text-gray-600">未领取费用</div>
				</div>
				<div className="bg-white p-6 rounded-lg border">
					<div className="text-2xl font-bold text-gray-900">
						{loading ? (
							<div className="flex items-center">
								<Loader2 className="h-5 w-5 animate-spin mr-2" />-
							</div>
						) : (
							`+${stats.totalReturn.toFixed(2)}%`
						)}
					</div>
					<div className="text-sm text-gray-600">总收益率</div>
				</div>
			</div>
			<div className="bg-white rounded-lg border overflow-hidden">
				<div className="p-6 border-b">
					<div className="flex items-center justify-between">
						<h2 className="text-xl text-gray-600">{t('swap.myPositions')}</h2>
						<Link
							href="/liquidity"
							className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
						>
							<Plus className="h-4 w-4" />
							{t('swap.newPosition')}
						</Link>
					</div>
				</div>
				{!isConnected ? (
					<div className="p-12 text-center">
						<Droplets className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{t('swap.pleaseConnectWallet')}
						</h3>
						<p className="text-gray-600">{t('swap.emptyPositionDesc')}</p>
					</div>
				) : error ? (
					<div className="p-12 text-center">
						<div className="text-red-500 text-lg font-medium mb-2">
							{t('swap.loadFailed')}
						</div>
						<p className="text-gray-600 mb-4">{error}</p>
						<button
							onClick={refetch}
							className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
						>
							{t('swap.reload')}
						</button>
					</div>
				) : loading ? (
					<div className="p-12 text-center">
						<Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
						<p className="text-gray-600">{t('swap.loading')}</p>
					</div>
				) : positions.length === 0 ? (
					<div className="p-12 text-center">
						<Droplets className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{t('swap.emptyPositionTitle')}
						</h3>
						<p className="text-gray-600 mb-4">{t('swap.emptyPositionDesc')}</p>
						<Link
							href="/liquidity"
							className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
						>
							<Plus className="h-4 w-4" />
							{t('swap.newPosition')}
						</Link>
					</div>
				) : null}
			</div>
		</div>
	);
}
