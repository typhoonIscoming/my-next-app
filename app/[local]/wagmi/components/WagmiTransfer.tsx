import { useState, useCallback } from 'react';
import { ChangeEvent, FormEvent, KeyboardEvent, FocusEvent } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { useWriteContract } from 'wagmi';
import { parseEther, erc20Abi, parseUnits } from 'viem';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { sepoliaContractAddress } from '@/lib/utils';

export default function WagmiTransfer() {
	const [transferAddress, setAddress] = useState<`0x${string}` | ''>('');
	const { sendTransaction, data } = useSendTransaction();
	const {
		status,
		data: txData,
		isLoading,
		isSuccess,
	} = useWaitForTransactionReceipt({
		hash: data,
	});

	const { data: hash, writeContract, isPending, error } = useWriteContract();
	// console.log('data', data, txData, status, isLoading, isSuccess);
	console.log('isPending', isPending, error);
	const handleTransfer = useCallback(() => {
		if (isLoading) {
			return;
		}
		// sendTransaction({
		// 	// to: '0x756A6aa43547fA8cCF02ab417E6c4c4747137346',
		// 	to: transferAddress || address,
		// 	value: parseEther('0.001'),
		// });
		const addr = transferAddress || '0x756A6aa43547fA8cCF02ab417E6c4c4747137346';
		writeContract({
			address: sepoliaContractAddress,
			abi: erc20Abi, // 使用 viem 提供的标准 ERC-20 ABI
			functionName: 'transfer',
			args: [
				addr, // 接收地址
				parseUnits('10000000000', 6), // 将用户输入的金额转换为合约精度 (USDC是6位小数)
			],
		});
	}, [isPending, transferAddress]);
	const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
		setAddress(e.target.value as `0x${string}`);
	};
	return (
		<div className="border rounded-2xl p-4 space-y-3">
			<div>使用wagmi进行转账操作</div>
			<div>
				<Input onChange={handleInput} />
			</div>
			<Button onClick={handleTransfer}>
				{isPending ? (
					<div className="flex items-center">
						<Spinner />
						<span className="ml-3">等待交易完成</span>
					</div>
				) : (
					'转账0.01ETH'
				)}
			</Button>
			<div>{isSuccess ? '交易已完成' : null}</div>
		</div>
	);
}
