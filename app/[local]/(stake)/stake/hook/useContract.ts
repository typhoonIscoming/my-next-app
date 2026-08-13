import { formatUnits } from 'viem';
import { sepolia } from 'wagmi/chains';
import { erc20Abi } from 'viem';
import { useAccount, useReadContracts, useChainId } from 'wagmi';
import { stakeContractAddress } from '@/lib/utils';
import { stakeAbi } from './abi';
import { format } from 'path';

export default function useContract() {
	const { address } = useAccount();
	const chainId = useChainId();
	const result = useReadContracts({
		allowFailure: true,
		contracts: [
			{
				address: stakeContractAddress,
				abi: stakeAbi,
				functionName: 'stakingBalance',
				chainId: chainId,
				args: [0n, address as `0x${string}`],
			},
			{
				address: stakeContractAddress,
				abi: stakeAbi,
				functionName: 'withdrawAmount',
				chainId: chainId,
				args: [0n, address as `0x${string}`],
			},
		],
	});
	console.log('result:', result);
	const [stakingBalance, withdrawAmount] = result.data ?? [];

	const stakingBalanceValue =
		stakingBalance?.status === 'success' ? (stakingBalance.result as bigint) : 0n;
	const withdrawAmountValue =
		withdrawAmount?.status === 'success' ? withdrawAmount.result : [0n, 0n];

	return {
		address,
		contractAddress: stakeContractAddress,
		chainId: chainId,
		stakingBalance: stakingBalanceValue,
		withdrawAmount: withdrawAmountValue,
		formatedStakingBalance: formatUnits(stakingBalanceValue, 18),
		formatedWithdrawAmount: formatUnits(withdrawAmountValue[0], 18),
		pendingWithdrawAmount: formatUnits(withdrawAmountValue[1], 18),
		isLoading: result.isLoading,
		isFetching: result.isFetching,
		isError: result.isError,
		error: result.error,
		refetch: result.refetch,
	};
}
