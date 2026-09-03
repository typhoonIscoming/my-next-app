import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ArrowDownSvgIcon } from './components/CustomSvgIcon';
import Button from '@mui/material/Button';

function assertValidLocale(locale: Lang) {
	if (!locale) {
		notFound();
	}
}

function TokenBadge({ symbol, name, color }: { symbol: string; name: string; color: string }) {
	return (
		<div className="flex items-center gap-3">
			<div
				className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white shadow-inner"
				style={{ background: color }}
			>
				{symbol.slice(0, 2)}
			</div>
			<div className="leading-none">
				<div className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">{name}</div>
				<div className="mt-1 text-base font-semibold text-white">{symbol}</div>
			</div>
		</div>
	);
}

export default async function SwapPage({ params }: { params: Promise<{ local: Lang }> }) {
	const { local } = await params;
	assertValidLocale(local);
	const t = await getTranslations('swap');

	return (
		<main className="min-h-screen bg-[#131313] text-white">
			<div className="mx-auto max-w-[1440px] px-4 pb-10 pt-4 sm:px-6 lg:px-8">
				<section className="flex min-h-[calc(100vh-120px)] items-center justify-center py-10">
					<div className="w-full max-w-[500px] rounded-[32px] backdrop-blur-2xl">
						<div className="rounded-[28px] p-4">
							<div className="mb-4 flex items-center justify-between px-2 py-1">
								<div className="flex items-center gap-2 text-sm font-semibold text-white">
									<span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
									{t('title')}
								</div>
								<button className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/3 text-zinc-200 transition hover:bg-white/5">
									<svg
										viewBox="0 0 24 24"
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.8"
									>
										<path
											d="M10 6.5h8.5M15.5 2l4.5 4.5-4.5 4.5M14 17.5H5.5M8.5 13l-4.5 4.5L8.5 22"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</button>
							</div>

							<div className="flex flex-col gap-2">
								<div className="rounded-[24px] border border-white/8 bg-[#161f33] p-4">
									<div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-zinc-400">
										<span>{t('from')}</span>
										<span>{t('balance')} 5.21</span>
									</div>
									<div className="flex items-center justify-between gap-4">
										<div className="text-[2.2rem] font-medium tracking-[-0.07em] text-white">
											0.01
										</div>
										<div className="flex items-center justify-end">
											<TokenBadge
												symbol="ETH"
												name="Ethereum"
												color="linear-gradient(135deg,#8a8fff,#5c6af7 40%,#1d294a)"
											/>
										</div>
									</div>
								</div>

								<div className="relative w-full flex justify-center">
									<button className="absolute cursor-pointer translate-y-[-50%] translate-x-[-50%] rounded-[8px] z-10 flex h-11 w-11 items-center justify-center border-4 border-[#131313] bg-[#151b2b] text-xl transition">
										<ArrowDownSvgIcon fontSize="small" />
									</button>
								</div>

								<div className="rounded-[24px] border border-white/8 bg-[#161f33] p-4">
									<div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-zinc-400">
										<span>{t('to')}</span>
										<span>{t('balance')} 2,174.91</span>
									</div>
									<div className="flex items-center justify-between gap-4">
										<div className="text-[2.2rem] font-medium tracking-[-0.07em] text-white">
											0.54
										</div>
										<div className="flex items-center justify-end">
											<TokenBadge
												symbol="USDC"
												name="USD Coin"
												color="linear-gradient(135deg,#6fe8ff,#4bd3bd 40%,#184c57)"
											/>
										</div>
									</div>
								</div>
							</div>

							<div className="mt-5 rounded-[22px] border border-white/8 bg-white/2 p-3">
								<div className="flex items-center justify-between text-sm text-zinc-300">
									<span>{t('rate')}</span>
									<span className="font-medium text-white">
										1 ETH = 54.17 USDC
									</span>
								</div>
								<div className="mt-3 flex items-center justify-between text-sm text-zinc-300">
									<span>{t('slippage')}</span>
									<span className="font-medium text-white">0.5%</span>
								</div>
								<div className="mt-3 flex items-center justify-between text-sm text-zinc-300">
									<span>{t('networkFee')}</span>
									<span className="font-medium text-white">~$2.31</span>
								</div>
							</div>

							<button className="mt-5 flex w-full items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#b29bff,#8a7bff_35%,#4a5df7)] px-5 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(96,89,255,0.45)] transition hover:brightness-110">
								{t('reviewSwap')}
							</button>
						</div>
					</div>
				</section>
			</div>
		</main>
	);
}
