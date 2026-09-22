'use client';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';
import Button from '@mui/material/Button';
import TransactionStatus from './transactionStatus';
import SelectStep, { SearchingPool, NoPoolFound } from './selectStep';
import type { TransactionAction, Step } from './types';
import LiquidityContext, { initialLiquidity } from './context';
import AddLiquidityStep from './addLiquidityStep';

export default function LiquidityPage() {
	// 步骤状态
	const [step, setStep] = useState<Step>('select');
	const [transactionAction, setTransactionAction] = useState<TransactionAction | null>(
		'addLiquidity'
	);

	const [contextValue, setContextValue] = useState(initialLiquidity);

	const backToSelect = () => {
		setStep('select');
	};
	const value = useMemo(() => {
		return {
			...contextValue,
			setPoolExists: (poolExists: boolean) => {
				setContextValue((prev) => ({ ...prev, poolExists }));
			},
			setIsCheckingPool: (isCheckingPool: boolean) => {
				setContextValue((prev) => ({ ...prev, isCheckingPool }));
			},
			setOtherValues: (otherValues: any) => {
				setContextValue((prev) => ({ ...prev, ...otherValues }));
			},
		};
	}, [contextValue]);
	return (
		<LiquidityContext.Provider value={value}>
			<div className="liquidity-container max-w-150 m-auto">
				<div className="bg-white border border-border rounded-2xl shadow-lg p-4">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-600">添加流动性</h2>
						{step !== 'select' && (
							<Button
								onClick={backToSelect}
								className="text-sm text-primary hover:text-primary/80"
							>
								重新选择
							</Button>
						)}
					</div>
					{step === 'addLiquidity' && (
						<TransactionStatus
							status="pending"
							action={transactionAction}
							hash="0x1234567890abcdef"
						/>
					)}
					{step === 'select' && <SelectStep onSetStep={(type: Step) => setStep(type)} />}
					{step === 'searching' && <SearchingPool />}
					{step === 'notFound' && (
						<NoPoolFound onSetStep={(type: Step) => setStep(type)} />
					)}
					{step === 'addLiquidity' && (
						<AddLiquidityStep
							onSetStep={(type: TransactionAction) => setTransactionAction(type)}
						/>
					)}
				</div>
			</div>
		</LiquidityContext.Provider>
	);
}
