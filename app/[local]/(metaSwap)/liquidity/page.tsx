'use client';
import { useState } from 'react';
import Button from '@mui/material/Button';
import TransactionStatus from './transactionStatus';
import SelectStep from './selectStep';
import type { TransactionAction, Step } from './types';

export default function LiquidityPage() {
	// 步骤状态
	const [step, setStep] = useState<Step>('select');
	const [transactionAction, setTransactionAction] = useState<TransactionAction | null>(
		'addLiquidity'
	);

	const backToSelect = () => {
		setStep('select');
	};
	return (
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
				{step === 'select' && <SelectStep />}
			</div>
		</div>
	);
}
