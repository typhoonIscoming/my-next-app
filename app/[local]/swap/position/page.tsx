import { getTranslations } from 'next-intl/server';

export default async function PositionPage() {
	const t = await getTranslations('swap');

	return (
		<main className="min-h-[calc(100vh-120px)] bg-[#050816] px-4 py-8 text-white sm:px-6 lg:px-8">
			<div className="mx-auto max-w-6xl">
				<div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-xs font-medium uppercase tracking-[0.22em] text-violet-300">
							{t('navPosition')}
						</p>
						<h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">
							{t('positionTitle')}
						</h1>
					</div>

					<button className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#b29bff,#8a7bff_35%,#4a5df7)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(96,89,255,0.45)] transition hover:brightness-110">
						+ {t('newPosition')}
					</button>
				</div>

				<div className="mb-6 grid gap-4 md:grid-cols-3">
					{[
						{ label: t('totalValue'), value: '$48,420.32', accent: 'text-violet-300' },
						{ label: t('feesEarned'), value: '$1,289.70', accent: 'text-emerald-300' },
						{ label: t('openPositions'), value: '12', accent: 'text-cyan-300' },
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
							<button className="rounded-full border border-white/10 bg-white/3 px-4 py-2 text-sm font-medium text-zinc-200">
								{t('navPool')}
							</button>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
