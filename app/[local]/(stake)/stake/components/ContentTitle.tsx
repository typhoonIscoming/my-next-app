'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useIsMounted from '@/hooks/useIsMounted';
import StakeIcon from '../../components/StakeIcon';
import useStakeWallet from '../hook/useStakeWallet';
import CustomConnectButton from '@/app/components/CustomConnectButton';

export default function ContentTitle({ local }: { local: Lang }) {
	const t = useTranslations('stake');
	const walletT = useTranslations('wallet');
	const isMounted = useIsMounted();
	const [amount, setAmount] = useState('');
	const [error, setError] = useState('');
	const {
		isConnected,
		isConnectPending,
		connectMetaMask,
		address,
		formattedBalance,
		balanceDecimals,
		disconnect,
	} = useStakeWallet();

	const isZh = local === 'zh';
	const isWalletConnected = isMounted && isConnected;
	const balanceText = useMemo(() => formattedBalance, [formattedBalance]);
	const balanceValue = useMemo(() => {
		const parsedBalance = Number(balanceText);
		return Number.isFinite(parsedBalance) ? parsedBalance : 0;
	}, [balanceText]);
	const parsedAmount = Number(amount || 0);
	const isSubmitDisabled = !amount || Number.isNaN(parsedAmount) || parsedAmount <= 0 || !!error;
	const isActionDisabled = isWalletConnected ? isSubmitDisabled : isConnectPending;

	const labels = {
		balance: isZh ? '可用余额' : 'Available balance',
		placeholder: isZh ? '输入数量，例如 1.25' : 'Enter amount, e.g. 1.25',
		max: 'MAX',
		errorInvalid: isZh ? '只能输入数字' : 'Numbers only',
		errorExceed: isZh ? '输入金额不能超过余额' : 'Amount cannot exceed balance',
		button: t('stake'),
	};

	const handleAmountChange = (event: ChangeEvent<HTMLInputElement>) => {
		const rawValue = event.target.value;
		if (!rawValue) {
			setAmount('');
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
			nextValue = `${intPart}.${decimalPart.slice(0, balanceDecimals ?? 18)}`;
		}

		const numericValue = Number(nextValue);
		if (isWalletConnected && !Number.isNaN(numericValue) && numericValue > balanceValue) {
			setAmount(nextValue);
			setError(labels.errorExceed);
			return;
		}

		setAmount(nextValue);
		if (nextValue && Number.isNaN(numericValue)) {
			setError(labels.errorInvalid);
		} else if (!error || error === labels.errorInvalid || error === labels.errorExceed) {
			setError('');
		}
	};

	const handleMax = () => {
		setAmount(balanceText);
		setError('');
	};

	const handlePrimaryAction = async () => {
		if (isWalletConnected) {
			return;
		}

		try {
			await connectMetaMask();
			setError('');
		} catch {
			setError(isZh ? '连接钱包失败，请重试' : 'Wallet connection failed. Please try again.');
		}
	};

	return (
		<Box className="mt-4 px-2">
			<div className="text-4xl text-center font-bold bg-linear-to-r from-(--from-primary) to-(--to-primary) text-transparent bg-clip-text mb-2">
				{t('title')}
			</div>
			<Box className="text-gray-400 text-center text-xl tracking-wide">{t('subtitle')}</Box>

			<Box className="form-wrapper mt-8">
				<Box className="card group max-w-2xl mx-auto p-4 sm:p-8 md:p-10 bg-linear-to-br from-[#0f1625]/95 via-[#101d30]/92 to-[#0c1322]/95 shadow-[0_24px_80px_rgba(7,16,28,0.55)] border-primary-500/25 border-[1.5px] rounded-2xl sm:rounded-3xl">
					<Box className="relative overflow-hidden flex items-start gap-4 sm:gap-5 p-4 sm:p-5 border group-hover:border-primary-500/45 rounded-2xl bg-linear-to-br from-gray-800/60 to-gray-900/75 border-primary-700/50 before:pointer-events-none before:absolute before:-top-20 before:-right-16 before:h-40 before:w-40 before:rounded-full before:bg-primary-500/12 before:blur-2xl">
						<StakeIcon />
						<Box className="flex-1 space-y-4">
							<Box className="form-label text-gray-300 text-lg sm:text-xl font-medium tracking-[0.01em]">
								{t('stakeAmount')}
							</Box>
							{address && isWalletConnected ? (
								<Box className="text-gray-400 text-sm sm:text-base">
									{t('connectedWallet')}: {address}
								</Box>
							) : null}
							<Box className="flex items-center justify-between gap-3 rounded-xl border border-primary-500/25 bg-black/20 px-3 py-2">
								<Box className="text-gray-400 text-sm">
									{t('available_balance')}
								</Box>
								<Box className="font-mono [font-variant-numeric:tabular-nums] text-sm sm:text-base text-white">
									{balanceText} ETH
								</Box>
							</Box>

							<Box className="form-input space-y-2">
								<Box className="flex items-center gap-2">
									<Input
										type="text"
										inputMode="decimal"
										value={amount}
										onChange={handleAmountChange}
										placeholder={labels.placeholder}
										aria-invalid={!!error}
										className="h-11 rounded-xl border-primary-500/30 bg-[#0a1320]/80 text-gray-100 placeholder:text-gray-500 focus-visible:border-primary-500"
									/>
									<Button
										type="button"
										variant="outline"
										onClick={handleMax}
										className="h-11 px-4 rounded-xl text-white border-primary-500/40 bg-primary-500/10 hover:bg-primary-500/20"
									>
										{t('max')}
									</Button>
								</Box>
								{error ? <Box className="text-xs text-red-300">{error}</Box> : null}
							</Box>

							{/* <Button
								type="button"
								onClick={handlePrimaryAction}
								disabled={isActionDisabled}
								className="w-full h-11 rounded-xl bg-linear-to-r from-primary-700 to-primary-500 text-white font-semibold tracking-wide hover:brightness-110 disabled:opacity-50"
							>
								{isWalletConnected ? t('stake') : walletT('loginWallet')}
							</Button> */}
							{!isWalletConnected ? (
								<CustomConnectButton>
									{({ openConnectModal }) => {
										return (
											<Button
												type="button"
												variant="outline"
												onClick={() => openConnectModal()}
												className="w-full h-11 px-4 rounded-xl text-white border-primary-500/40 bg-primary-500/10 hover:bg-primary-500/20"
											>
												{walletT('loginWallet')}
											</Button>
										);
									}}
								</CustomConnectButton>
							) : (
								<Box className="flex items-center gap-2">
									<Button
										type="button"
										onClick={() => disconnect()}
										className="w-auto h-11 rounded-xl bg-linear-to-r from-primary-700 to-primary-500 text-white font-semibold tracking-wide hover:brightness-110 disabled:opacity-50 mb-2"
									>
										{walletT('logoutWallet')}
									</Button>
									<Button
										type="button"
										onClick={handlePrimaryAction}
										disabled={isActionDisabled}
										className="flex-1 h-11 rounded-xl bg-linear-to-r from-primary-700 to-primary-500 text-white font-semibold tracking-wide hover:brightness-110 disabled:opacity-50"
									>
										{isWalletConnected ? t('stake') : walletT('loginWallet')}
									</Button>
								</Box>
							)}
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
