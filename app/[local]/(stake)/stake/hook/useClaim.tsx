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
