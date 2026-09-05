'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useReadPositions } from '../hooks/useReadPositions';

const mockPositions = [
	{
		id: '1',
		pair: 'ETH / USDC',
		fee: '0.3%',
		range: '1,450 - 1,700',
		liquidity: '$12,480.20',
		status: 'In range',
	},
	{
		id: '2',
		pair: 'BTC / ETH',
		fee: '0.5%',
		range: '0.07 - 0.09',
		liquidity: '$18,290.60',
		status: 'Close',
	},
];

export default function PositionList() {
	const t = useTranslations('swap');
	const positions = useReadPositions();
	console.log('positions', positions);

	if (!mockPositions.length) {
		return (
			<section className="rounded-[32px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
				<div className="mb-5 flex items-center justify-between">
					<h2 className="text-lg font-semibold text-white">{t('activePositions')}</h2>
					<button className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5 text-sm text-zinc-200 transition hover:bg-white/5">
						{t('viewAll')}
					</button>
				</div>

				<div className="rounded-[28px] border border-dashed border-violet-500/20 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.16),transparent_50%)] p-10 text-center">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-2xl shadow-[0_0_40px_rgba(139,92,246,0.25)]">
						◎
					</div>
					<h3 className="mt-6 text-2xl font-semibold tracking-tighter text-white">
						{t('emptyPositionTitle')}
					</h3>
					<p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
						{t('emptyPositionDesc')}
					</p>
					<div className="mt-6 flex items-center justify-center gap-3">
						<button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a0d17]">
							{t('connectWallet')}
						</button>
						<Link
							href="/swap/pool"
							className="rounded-full border border-white/10 bg-white/3 px-4 py-2 text-sm font-medium text-zinc-200"
						>
							{t('navPool')}
						</Link>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="rounded-[32px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-white">{t('activePositions')}</h2>
				<button className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5 text-sm text-zinc-200 transition hover:bg-white/5">
					{t('viewAll')}
				</button>
			</div>

			<div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0b1220]">
				<div className="grid grid-cols-[1.5fr_1fr_1.2fr_1fr_0.8fr] gap-4 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-zinc-400">
					<div>Pair</div>
					<div>Fee</div>
					<div>Range</div>
					<div>Liquidity</div>
					<div>Status</div>
				</div>

				{mockPositions.map((item) => (
					<div
						key={item.id}
						className="grid grid-cols-[1.5fr_1fr_1.2fr_1fr_0.8fr] items-center gap-4 border-b border-white/5 px-4 py-4 text-sm text-white last:border-b-0"
					>
						<div className="font-medium">{item.pair}</div>
						<div className="text-zinc-300">{item.fee}</div>
						<div className="text-zinc-300">{item.range}</div>
						<div className="font-medium text-violet-300">{item.liquidity}</div>
						<div>
							<span
								className={
									item.status === 'In range'
										? 'rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300'
										: 'rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-300'
								}
							>
								{item.status}
							</span>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
