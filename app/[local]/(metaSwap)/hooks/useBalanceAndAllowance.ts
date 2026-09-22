import { useCallback } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { formatUnits } from 'viem';
import { BaseError } from 'viem';
import { ERC20_ABI } from '@/lib/metaAbi';
import { contracts } from '@/lib/utils';

export default function useBalanceAndAllowance() {
	const publicClient = usePublicClient();
	const { address } = useAccount();
	return useCallback(
		async ({
			tokenAddress,
			amountRequired,
			tokenSymbol,
			tokenDecimals,
		}: {
			tokenAddress: `0x${string}`;
			amountRequired: bigint;
			tokenSymbol: string;
			tokenDecimals: number;
		}) => {
			if (!address || !publicClient || amountRequired <= 0n) return;

			const bytecode = await publicClient.getBytecode({
				address: tokenAddress,
			});

			if (!bytecode || bytecode === '0x') {
				throw new Error(
					`${tokenSymbol} 合约地址在当前网络不存在：${tokenAddress}。请确认钱包已切换到 Sepolia，且 WETH 地址配置正确。`
				);
			}

			let balance: bigint;
			let allowance: bigint;

			try {
				[balance, allowance] = await Promise.all([
					publicClient.readContract({
						address: tokenAddress,
						abi: ERC20_ABI,
						functionName: 'balanceOf',
						args: [address],
					}),
					publicClient.readContract({
						address: tokenAddress,
						abi: ERC20_ABI,
						functionName: 'allowance',
						args: [address, contracts.META_NODE_MANAGER as `0x${string}`],
					}),
				]);
			} catch (error) {
				if (error instanceof BaseError) {
					throw new Error(
						`${tokenSymbol} 读取余额/授权失败，请确认当前网络与代币地址匹配（${tokenAddress}）。${error.shortMessage ?? ''}`.trim()
					);
				}
				throw error;
			}

			if (balance < amountRequired) {
				throw new Error(
					`${tokenSymbol} 余额不足（需要 ${formatUnits(amountRequired, tokenDecimals)}，当前 ${formatUnits(balance, tokenDecimals)}）`
				);
			}

			if (allowance < amountRequired) {
				throw new Error(
					`${tokenSymbol} 授权不足（需要 ${formatUnits(amountRequired, tokenDecimals)}，当前 ${formatUnits(allowance, tokenDecimals)}）`
				);
			}
		},
		[publicClient, address]
	);
}
