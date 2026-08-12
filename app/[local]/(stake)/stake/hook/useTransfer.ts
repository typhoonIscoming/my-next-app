import { useCallback } from 'react';
import { parseUnits, type Address } from 'viem';
import { useAccount, usePublicClient, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { stakeContractAddress } from '@/lib/utils';
import { stakeAbi } from './abi';

export type TransferParams = {
	to: Address;
	amount: string;
	decimals?: number;
};

export default function useTransfer() {
	const { address } = useAccount();
	const publicClient = usePublicClient();
	const { writeContract, data: hash, isPending, error, reset, status } = useWriteContract();
	const receipt = useWaitForTransactionReceipt({
		hash,
	});

	const transfer = useCallback(
		async ({ to, amount, decimals = 18 }: TransferParams) => {
			if (!stakeContractAddress) {
				throw new Error('Stake contract address is not configured.');
			}
			if (!address) {
				throw new Error('Wallet not connected.');
			}
			if (!to) {
				throw new Error('Recipient address is required.');
			}
			const normalizedAmount = amount.trim();
			if (!normalizedAmount || Number.isNaN(Number(normalizedAmount))) {
				throw new Error('Transfer amount is invalid.');
			}

			const value = parseUnits(normalizedAmount, decimals);
			if (value <= 0n) {
				throw new Error('Transfer amount must be greater than zero.');
			}

			let estimatedGas: bigint;
			if (publicClient) {
				estimatedGas = await publicClient.estimateContractGas({
					address: stakeContractAddress,
					account: address,
					abi: stakeAbi,
					functionName: 'depositETH',
					value,
				});
			} else {
				estimatedGas = 200000n;
			}

			const txHash = await new Promise<`0x${string}`>((resolve, reject) => {
				writeContract(
					{
						address: stakeContractAddress,
						abi: stakeAbi,
						functionName: 'depositETH',
						gas: estimatedGas,
						value,
					},
					{
						onSuccess: (tx) => resolve(tx),
						onError: reject,
					}
				);
			});

			return txHash;
		},
		[address, publicClient, writeContract]
	);

	return {
		transfer,
		hash,
		isPending,
		status,
		error: error ?? receipt.error,
		isLoading: receipt.isLoading,
		isSuccess: receipt.isSuccess,
		txHash: hash,
		receipt,
		reset,
	};
}
