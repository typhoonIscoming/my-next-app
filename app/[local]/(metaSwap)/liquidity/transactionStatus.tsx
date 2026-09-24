'use client';
import { useContext } from 'react';
import { useTranslations } from 'next-intl';
import { Clock, CheckCircle } from 'lucide-react';
import { formatAddress, cn } from '@/lib/utils';
import { useAccount } from 'wagmi';
import useIsMobile from '@/hooks/useIsMobile';
import { type TransactionStatusProps } from './types';
import liquidityContext from './context';

export default function TransactionStatus({
	status,
	action,
}: {
	status: TransactionStatusProps['status'];
	action: TransactionStatusProps['action'] | null;
}) {
	const t = useTranslations();
	const { address, isConnected } = useAccount();
	const isMobile = useIsMobile();
	const { hash } = useContext(liquidityContext);
	const isPending = status === 'pending';
	const isConfirmed = status === 'confirmed';
	const isSuccess = status === 'success';

	const actionLabel =
		action === 'approve0' || action === 'approve1'
			? t('swap.approve')
			: action === 'wrap0' || action === 'wrap1'
				? t('swap.wrapETH')
				: action === 'createPool'
					? t('swap.createPool')
					: action === 'addLiquidity'
						? t('swap.addLiquidity')
						: t('swap.transaction');
	return (
		<div className="transaction-status-container">
			<div
				className={cn(
					'flex flex-col items-center',
					!isMobile ? 'flex-row justify-center space-x-2' : 'space-y-2'
				)}
			>
				{isPending && (
					<>
						<Clock className="w-5 h-5 text-primary animate-spin" />
						<span className="text-primary">
							{actionLabel}
							{t('swap.pending')}
						</span>
					</>
				)}
				{isConfirmed && (
					<>
						<Clock className="w-5 h-5 text-primary" />
						<span className="text-primary">
							{actionLabel}
							{t('swap.confirmed')}
						</span>
					</>
				)}
				{isSuccess && (
					<>
						<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
						<span className="text-green-700 dark:text-green-300">
							{actionLabel}
							{t('swap.success')}
						</span>
					</>
				)}
			</div>
			<div className="text-sm mt-2 text-center text-primary">
				{t('swap.hash')}: {formatAddress(hash)}
			</div>
			{isConnected && address && (
				<div className="mt-4 text-center p-3 bg-primary/10 rounded-lg">
					<div className="text-sm text-primary">
						{t('swap.connected')}: {formatAddress(address)}
					</div>
				</div>
			)}
		</div>
	);
}
