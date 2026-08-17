import { formatUnits, parseUnits, type Address } from 'viem';
import { useAccount, useReadContracts, useChainId, useWriteContract } from 'wagmi';
import { stakeContractAddress } from '@/lib/utils';
import { stakeAbi } from './abi';

// 获取收益
export default function useClaim() {
	const { address } = useAccount();
	const chainId = useChainId();
	const result = useReadContracts({
		allowFailure: true,
		contracts: [
			{
				address: stakeContractAddress,
				abi: stakeAbi,
				functionName: 'user',
				chainId: chainId,
				args: [0n, address as `0x${string}`],
			},
		],
	});
	// console.log('useClaim result:', result);
	const rewards = result.data?.[0]?.result ? formatUnits(result.data[0].result[2], 18) : '0';
	const balance = result.data?.[0]?.result ? formatUnits(result.data[0].result[0], 18) : '0';
	return {
		claimableRewards: rewards,
		claimableBalance: balance,
		isLoading: result.isLoading,
		isFetching: result.isFetching,
		isError: result.isError,
		error: result.error,
		refetch: result.refetch,
		lastUpdateDate: result.dataUpdatedAt,
	};
}

export function useClaimRewards() {
	const { address } = useAccount();
	const chainId = useChainId();
	const { writeContract, data: hash, isPending, error, reset, status } = useWriteContract();

	const claimRewards = async (pid = 0n) => {
		if (!stakeContractAddress) {
			throw new Error('Stake contract address is not configured.');
		}
		if (!address) {
			throw new Error('Wallet not connected.');
		}

		const txHash = await new Promise<`0x${string}`>((resolve, reject) => {
			writeContract(
				{
					address: stakeContractAddress,
					abi: stakeAbi,
					functionName: 'claim',
					chainId: chainId,
					args: [pid],
				},
				{
					onSuccess: (hash) => {
						resolve(hash);
					},
					onError: (error) => {
						reject(error);
					},
				}
			);
		});

		return txHash;
	};
	return { claimRewards, hash, isPending, error, reset, status };
}
