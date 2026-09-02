import { getTranslations } from 'next-intl/server';

export default async function PoolPage() {
	const t = await getTranslations('swap');

	return (
		<main className="min-h-[calc(100vh-120px)] bg-[#050816] px-4 py-8 text-white sm:px-6 lg:px-8">
			<div className="mx-auto max-w-6xl">
				<div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
							{t('navPool')}
						</p>
						<h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">
							{t('poolTitle')}
						</h1>
					</div>

					<button className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#6fe8ff,#4bd3bd_35%,#2dbf9a)] px-5 py-2.5 text-sm font-semibold text-[#07131a] shadow-[0_18px_36px_rgba(59,201,175,0.35)] transition hover:brightness-110">
						+ {t('createPool')}
					</button>
				</div>

				<div className="mb-6 grid gap-4 md:grid-cols-3">
					{[
						{ label: t('totalLiquidity'), value: '$128.4M', accent: 'text-cyan-300' },
						{ label: t('volume24h'), value: '$9.7M', accent: 'text-emerald-300' },
						{ label: t('feesCollected'), value: '$1.2M', accent: 'text-violet-300' },
					].map((item) => (
						<div
							key={item.label}
							className="rounded-[24px] border border-white/10 bg-white/3 p-4 backdrop-blur-xl"
						>
							<p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
								{item.label}
							</p>
							<div
								className={`mt-3 text-2xl font-semibold tracking-[-0.06em] ${item.accent}`}
							>
								{item.value}
							</div>
						</div>
					))}
				</div>

				<section className="rounded-[32px] border border-white/10 bg-[#111827]/90 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
					<div className="mb-5 flex items-center justify-between">
						<h2 className="text-lg font-semibold text-white">{t('popularPools')}</h2>
						<button className="rounded-full border border-white/10 bg-white/3 px-3 py-1.5 text-sm text-zinc-200 transition hover:bg-white/5">
							{t('seeAll')}
						</button>
					</div>

					<div className="space-y-4">
						{[
							{ pair: 'ETH / USDC', fee: '0.05%', tvl: '$63.4M', apr: '3.92%' },
							{ pair: 'WBTC / ETH', fee: '0.30%', tvl: '$41.1M', apr: '2.71%' },
							{ pair: 'USDC / USDT', fee: '0.01%', tvl: '$17.9M', apr: '4.36%' },
						].map((pool) => (
							<div
								key={pool.pair}
								className="flex flex-col gap-4 rounded-[24px] border border-white/8 bg-white/2 p-4 md:flex-row md:items-center md:justify-between"
							>
								<div className="flex items-center gap-3">
									<div className="flex -space-x-2">
										<div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0f172a] bg-[linear-gradient(135deg,#8a8fff,#5c6af7)] text-xs font-bold text-white">
											ETH
										</div>
										<div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0f172a] bg-[linear-gradient(135deg,#6fe8ff,#4bd3bd)] text-xs font-bold text-[#07131a]">
											USDC
										</div>
									</div>
									<div>
										<p className="text-lg font-semibold text-white">
											{pool.pair}
										</p>
										<p className="text-sm text-zinc-400">Fee {pool.fee}</p>
									</div>
								</div>

								<div className="grid gap-2 text-sm text-zinc-300 sm:grid-cols-3">
									<div>
										<p className="uppercase tracking-[0.16em] text-zinc-500">
											TVL
										</p>
										<p className="mt-1 font-medium text-white">{pool.tvl}</p>
									</div>
									<div>
										<p className="uppercase tracking-[0.16em] text-zinc-500">
											APR
										</p>
										<p className="mt-1 font-medium text-white">{pool.apr}</p>
									</div>
									<div className="flex items-center justify-start md:justify-end">
										<button className="rounded-full border border-white/10 bg-white/3 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-white/5">
											{t('addLiquidity')}
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</section>
			</div>
		</main>
	);
}
