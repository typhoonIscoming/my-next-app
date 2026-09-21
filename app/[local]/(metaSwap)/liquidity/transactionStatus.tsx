import { useTranslations } from 'next-intl';
import { ChevronDown, Clock, CheckCircle, AlertCircle, ArrowUpDown, Info } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import { type TransactionStatusProps } from './types';

export default function TransactionStatus({
	status,
	action,
	hash,
}: {
	status: TransactionStatusProps['status'];
	action: TransactionStatusProps['action'] | null;
	hash: TransactionStatusProps['hash'];
}) {
	const t = useTranslations();
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
			<div className="flex flex-col items-center space-y-2">
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
				<div className="text-sm text-primary">
					{t('swap.hash')}: {formatAddress(hash)}
				</div>
			</div>
		</div>
	);
}
