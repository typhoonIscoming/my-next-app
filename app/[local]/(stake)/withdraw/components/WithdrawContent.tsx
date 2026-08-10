'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const STAKED_AMOUNT = 0;
const AVAILABLE_TO_WITHDRAW = 0;
const PENDING_WITHDRAW = 0;

export default function WithdrawContent({ local }: { local: Lang }) {
	const tStake = useTranslations('stake');
	const tWallet = useTranslations('wallet');
	const [unstakeAmount, setUnstakeAmount] = useState('');
	const [error, setError] = useState('');

	const isZh = local === 'zh';
	const stakedText = useMemo(() => STAKED_AMOUNT.toFixed(4), []);
	const availableText = useMemo(() => AVAILABLE_TO_WITHDRAW.toFixed(4), []);
	const pendingText = useMemo(() => PENDING_WITHDRAW.toFixed(4), []);
	const parsedAmount = Number(unstakeAmount || 0);
	const isUnstakeDisabled =
		!unstakeAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0 || !!error;

	const labels = {
		unstakePlaceholder: isZh ? '输入要解除质押的数量' : 'Enter amount to unstake',
		errorInvalid: isZh ? '只能输入数字' : 'Numbers only',
		errorExceed: isZh ? '输入金额不能超过已质押数量' : 'Amount cannot exceed staked amount',
	};

	const handleUnstakeChange = (event: ChangeEvent<HTMLInputElement>) => {
		const rawValue = event.target.value;
		if (!rawValue) {
			setUnstakeAmount('');
			setError('');
			return;
		}

		let nextValue = rawValue.replace(/[^\d.]/g, '');
		if (nextValue !== rawValue) {
			setError(labels.errorInvalid);
		}

		const dotIndex = nextValue.indexOf('.');
		if (dotIndex !== -1) {
			nextValue =
				nextValue.slice(0, dotIndex + 1) + nextValue.slice(dotIndex + 1).replace(/\./g, '');
		}

		if (nextValue.startsWith('.')) {
			nextValue = `0${nextValue}`;
		}

		if (nextValue.includes('.')) {
			const [intPart, decimalPart] = nextValue.split('.');
			nextValue = `${intPart}.${decimalPart.slice(0, 6)}`;
		}

		const numericValue = Number(nextValue);
		if (!Number.isNaN(numericValue) && numericValue > STAKED_AMOUNT) {
			setUnstakeAmount(stakedText);
			setError(labels.errorExceed);
			return;
		}

		setUnstakeAmount(nextValue);
		if (nextValue && Number.isNaN(numericValue)) {
			setError(labels.errorInvalid);
		} else {
			setError('');
		}
	};

	return (
		<main className="mt-4 px-2 pb-8">
			<header className="text-center">
				<h1 className="text-4xl font-bold bg-linear-to-r from-(--from-primary) to-(--to-primary) text-transparent bg-clip-text mb-2">
					{tStake('withdraw')}
				</h1>
				<p className="text-gray-400 text-lg sm:text-xl tracking-wide">
					{tStake('withdrawSubtitle')}
				</p>
			</header>

			<section className="mt-8 max-w-4xl mx-auto rounded-2xl border border-primary-500/25 bg-linear-to-br from-[#0f1625]/95 via-[#101d30]/92 to-[#0c1322]/95 p-4 sm:p-6 shadow-[0_24px_80px_rgba(7,16,28,0.55)]">
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					<div className="rounded-xl border border-primary-500/25 bg-black/20 p-4">
						<div className="text-xs sm:text-sm text-gray-400">
							{tStake('stakedAmount')}
						</div>
						<div className="mt-1 text-base sm:text-lg font-mono [font-variant-numeric:tabular-nums] text-white">
							{stakedText} ETH
						</div>
					</div>
					<div className="rounded-xl border border-primary-500/25 bg-black/20 p-4">
						<div className="text-xs sm:text-sm text-gray-400">
							{tStake('availableToWithdraw')}
						</div>
						<div className="mt-1 text-base sm:text-lg font-mono [font-variant-numeric:tabular-nums] text-white">
							{availableText} ETH
						</div>
					</div>
					<div className="rounded-xl border border-primary-500/25 bg-black/20 p-4">
						<div className="text-xs sm:text-sm text-gray-400">
							{tStake('pendingWithdraw')}
						</div>
						<div className="mt-1 text-base sm:text-lg font-mono [font-variant-numeric:tabular-nums] text-white">
							{pendingText} ETH
						</div>
					</div>
				</div>

				<div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
					<section className="rounded-2xl border border-primary-700/50 bg-linear-to-br from-gray-800/60 to-gray-900/75 p-4 sm:p-5">
						<h2 className="text-lg font-semibold text-white">{tStake('unstake')}</h2>
						<div className="mt-3 text-sm text-gray-300">
							{tStake('amountToUnstake')}
						</div>
						<div className="mt-2 flex items-center gap-2">
							<Input
								type="text"
								inputMode="decimal"
								value={unstakeAmount}
								onChange={handleUnstakeChange}
								placeholder={labels.unstakePlaceholder}
								aria-invalid={!!error}
								className="h-11 rounded-xl border-primary-500/30 bg-[#0a1320]/80 text-gray-100 placeholder:text-gray-500 focus-visible:border-primary-500"
							/>
							<span className="text-sm text-gray-300">ETH</span>
						</div>
						{error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
						<Button
							type="button"
							disabled={isUnstakeDisabled}
							className="mt-4 w-full h-11 rounded-xl bg-linear-to-r from-primary-700 to-primary-500 text-white font-semibold tracking-wide hover:brightness-110 disabled:opacity-50"
						>
							{tWallet('loginWallet')}
						</Button>
					</section>

					<section className="rounded-2xl border border-primary-700/50 bg-linear-to-br from-gray-800/60 to-gray-900/75 p-4 sm:p-5">
						<h2 className="text-lg font-semibold text-white">{tStake('withdraw')}</h2>
						<div className="mt-3 text-sm text-gray-300">
							{tStake('readyToWithdraw')}
						</div>
						<div className="mt-1 text-base sm:text-lg font-mono [font-variant-numeric:tabular-nums] text-white">
							{availableText} ETH
						</div>

						<div className="mt-4 rounded-xl border border-primary-500/25 bg-black/20 px-3 py-3">
							<div className="flex items-center gap-2 text-primary-500 text-sm">
								<span className="inline-block h-2.5 w-2.5 rounded-full bg-primary-500 shadow-[0_0_10px_color-mix(in_srgb,var(--primary)_55%,transparent)]" />
								{tStake('cooldownTime')}
							</div>
							<p className="mt-2 text-xs sm:text-sm text-gray-400 leading-relaxed">
								{tStake('cooldownDesc')}
							</p>
						</div>

						<Button
							type="button"
							className="mt-4 w-full h-11 rounded-xl bg-linear-to-r from-primary-700 to-primary-500 text-white font-semibold tracking-wide hover:brightness-110"
						>
							{tStake('withdrawEth')}
						</Button>
					</section>
				</div>
			</section>
		</main>
	);
}
