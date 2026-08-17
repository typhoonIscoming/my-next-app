'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useContract from '../../stake/hook/useContract';
import useClaim, { useClaimRewards } from '../../stake/hook/useClaim';

const CLAIMABLE_REWARDS = 0;
const CLAIMABLE_BALANCE = 0;
const PENDING_REWARDS = 0;

export default function ClaimContent({ local }: { local: Lang }) {
	const tStake = useTranslations('stake');
	const [claimAmount, setClaimAmount] = useState('');
	const [error, setError] = useState('');

	const { formatedStakingBalance } = useContract();
	const { claimableRewards, claimableBalance, lastUpdateDate, isLoading, refetch } = useClaim();
	const { claimRewards, isPending, error: claimError, status } = useClaimRewards();

	void local;
	const claimableRewardsText = useMemo(
		() => Number(claimableRewards).toFixed(4),
		[claimableRewards]
	);
	const claimableBalanceText = useMemo(
		() => Number(claimableBalance).toFixed(4),
		[claimableBalance]
	);
	const pendingRewardsText = useMemo(() => Number(PENDING_REWARDS).toFixed(4), []);
	const parsedAmount = Number(claimAmount || 0);
	const isClaimDisabled =
		!claimAmount || Number.isNaN(parsedAmount) || parsedAmount <= 0 || !!error || isPending;

	const labels = {
		placeholder: tStake('claimInputPlaceholder'),
		errorInvalid: tStake('claimErrorInvalidNumber'),
		errorExceed: tStake('claimErrorExceedClaimable'),
		tokenSymbol: tStake('tokenEthSymbol'),
	};

	const handleClaimAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
		const rawValue = event.target.value;
		if (!rawValue) {
			setClaimAmount('');
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
		if (!Number.isNaN(numericValue) && numericValue > CLAIMABLE_REWARDS) {
			setClaimAmount(claimableRewardsText);
			setError(labels.errorExceed);
			return;
		}

		setClaimAmount(nextValue);
		if (nextValue && Number.isNaN(numericValue)) {
			setError(labels.errorInvalid);
		} else {
			setError('');
		}
	};

	const handleMaxClaim = () => {
		setClaimAmount(claimableRewardsText);
		setError('');
	};

	// 提现操作
	const handleClaim = async () => {
		if (isClaimDisabled) {
			return;
		}
		try {
			await claimRewards();
			setClaimAmount('');
			setError('');
			refetch();
		} catch (err) {
			console.error('Claim failed:', err);
		}
	};

	return (
		<main className="mt-4 px-2 pb-8">
			<header className="text-center">
				<h1 className="text-4xl font-bold bg-linear-to-r from-(--from-primary) to-(--to-primary) text-transparent bg-clip-text mb-2">
					{tStake('claim')}
				</h1>
				<p className="text-gray-400 text-lg sm:text-xl tracking-wide">
					{tStake('claimSubtitle')}
				</p>
			</header>

			<section className="mt-8 max-w-4xl mx-auto rounded-2xl border border-primary-500/25 bg-linear-to-br from-[#0f1625]/95 via-[#101d30]/92 to-[#0c1322]/95 p-4 sm:p-6 shadow-[0_24px_80px_rgba(7,16,28,0.55)]">
				{isLoading ? (
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						{Array.from({ length: 3 }).map((_, index) => (
							<div
								key={index}
								className="rounded-xl border border-primary-500/25 bg-black/20 p-4"
							>
								<Skeleton className="h-3 w-20 rounded bg-primary-500/20" />
								<Skeleton className="mt-3 h-6 w-28 rounded bg-primary-500/20" />
							</div>
						))}
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						<div className="rounded-xl border border-primary-500/25 bg-black/20 p-4">
							<div className="text-xs sm:text-sm text-gray-400">
								{tStake('claimAmount')}
							</div>
							<div className="mt-1 text-base sm:text-lg font-mono [font-variant-numeric:tabular-nums] text-white">
								{claimableRewardsText} MetaNode
							</div>
						</div>
						<div className="rounded-xl border border-primary-500/25 bg-black/20 p-4">
							<div className="text-xs sm:text-sm text-gray-400">
								{tStake('stakedAmount')}
							</div>
							<div className="mt-1 text-base sm:text-lg font-mono [font-variant-numeric:tabular-nums] text-white">
								{formatedStakingBalance} {labels.tokenSymbol}
							</div>
						</div>
						<div className="rounded-xl border border-primary-500/25 bg-black/20 p-4">
							<div className="text-xs sm:text-sm text-gray-400">
								{tStake('lastUpdateDate')}
							</div>
							<div className="mt-1 text-base sm:text-lg font-mono [font-variant-numeric:tabular-nums] text-white">
								{new Date(lastUpdateDate).toLocaleString() ?? 'Never'}
							</div>
						</div>
					</div>
				)}

				<div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
					<section className="rounded-2xl border border-primary-700/50 bg-linear-to-br from-gray-800/60 to-gray-900/75 p-4 sm:p-5">
						<h2 className="text-lg font-semibold text-white">{tStake('claim')}</h2>
						<div className="mt-3 text-sm text-gray-300">{tStake('claimAmount')}</div>
						<div className="mt-2 flex items-center gap-2">
							<Input
								type="text"
								inputMode="decimal"
								value={claimAmount}
								onChange={handleClaimAmountChange}
								placeholder={labels.placeholder}
								aria-invalid={!!error}
								className="h-11 rounded-xl border-primary-500/30 bg-[#0a1320]/80 text-gray-100 placeholder:text-gray-500 focus-visible:border-primary-500"
							/>
							<Button
								type="button"
								variant="outline"
								onClick={handleMaxClaim}
								className="h-11 px-4 rounded-xl text-white border-primary-500/40 bg-primary-500/10 hover:bg-primary-500/20"
							>
								{tStake('maxClaim')}
							</Button>
						</div>
						{error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
						<Button
							type="button"
							onClick={handleClaim}
							loading={isPending}
							disabled={isClaimDisabled}
							className="mt-4 w-full h-11 rounded-xl bg-linear-to-r from-primary-700 to-primary-500 text-white font-semibold tracking-wide hover:brightness-110 disabled:opacity-50"
						>
							{tStake('claimEth')}
						</Button>
					</section>

					<section className="rounded-2xl border border-primary-700/50 bg-linear-to-br from-gray-800/60 to-gray-900/75 p-4 sm:p-5">
						<h2 className="text-lg font-semibold text-white">{tStake('claimable')}</h2>
						<div className="mt-3 text-sm text-gray-300">{tStake('readyToClaim')}</div>
						<div className="mt-1 text-base sm:text-lg font-mono [font-variant-numeric:tabular-nums] text-white">
							{claimableRewardsText} MetaNode
						</div>

						<div className="mt-4 rounded-xl border border-primary-500/25 bg-black/20 px-3 py-3">
							<div className="flex items-center gap-2 text-primary-500 text-sm">
								<span className="inline-block h-2.5 w-2.5 rounded-full bg-primary-500 shadow-[0_0_10px_color-mix(in_srgb,var(--primary)_55%,transparent)]" />
								{tStake('claimCycleTitle')}
							</div>
							<p className="mt-2 text-xs sm:text-sm text-gray-400 leading-relaxed">
								{tStake('claimCycleDesc')}
							</p>
						</div>
					</section>
				</div>
			</section>
		</main>
	);
}
