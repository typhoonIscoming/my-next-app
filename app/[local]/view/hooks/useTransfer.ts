// hooks/viem/useTransfer.ts - 纯 Viem 版本
import { useState, useCallback } from 'react';
import { parseEther, type Address } from 'viem';
import { useClients } from './useClients';
import { useWallet } from './useWallet';
import { ERC20_ABI } from './config';

interface TransferOptions {
	to: Address;
	amount: string;
	tokenAddress?: Address;
}

interface TransferState {
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	hash: `0x${string}` | null;
	error: Error | null;
}

export const useTransfer = () => {
	const { publicClient, walletClient } = useClients();
	const { address, isConnected } = useWallet();
	const [state, setState] = useState<TransferState>({
		isPending: false,
		isSuccess: false,
		isError: false,
		hash: null,
		error: null,
	});

	const transfer = useCallback(
		async (options: TransferOptions) => {
			if (!isConnected || !address) {
				const error = new Error('请先连接钱包');
				setState((prev) => ({
					...prev,
					isError: true,
					error,
				}));
				throw error;
			}

			setState({
				isPending: true,
				isSuccess: false,
				isError: false,
				hash: null,
				error: null,
			});

			try {
				let hash: `0x${string}`;

				if (options.tokenAddress) {
					// ERC20 代币转账
					hash = await walletClient.writeContract({
						address: options.tokenAddress,
						abi: ERC20_ABI,
						functionName: 'transfer',
						args: [options.to, parseEther(options.amount)],
						account: address,
					} as any); // 临时绕过类型检查
				} else {
					// 原生 ETH 转账
					hash = await walletClient.sendTransaction({
						to: options.to,
						value: parseEther(options.amount),
						account: address,
					});
				}

				// 等待交易确认
				const receipt = await publicClient.waitForTransactionReceipt({
					hash,
					confirmations: 1,
				});

				setState((prev) => ({
					...prev,
					isPending: false,
					isSuccess: receipt.status === 'success',
					hash,
				}));

				return receipt;
			} catch (error) {
				const err = error as Error;
				setState((prev) => ({
					...prev,
					isPending: false,
					isError: true,
					error: err,
				}));
				throw err;
			}
		},
		[address, isConnected, publicClient, walletClient]
	);

	const reset = useCallback(() => {
		setState({
			isPending: false,
			isSuccess: false,
			isError: false,
			hash: null,
			error: null,
		});
	}, []);

	return {
		...state,
		transfer,
		reset,
	};
};
