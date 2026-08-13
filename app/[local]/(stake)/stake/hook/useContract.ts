import { formatUnits, parseUnits, type Address } from 'viem';
import { useAccount, useReadContracts, useChainId, useWriteContract } from 'wagmi';
import { stakeContractAddress } from '@/lib/utils';
import { stakeAbi } from './abi';

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
	// console.log('result:', result);
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

export function useUnstake() {
	const { address } = useAccount();
	const chainId = useChainId();
	const { writeContract, data: hash, isPending, error, reset, status } = useWriteContract();

	const unstake = async (amount: string, pid = 0n) => {
		if (!stakeContractAddress) {
			throw new Error('Stake contract address is not configured.');
		}
		if (!address) {
			throw new Error('Wallet not connected.');
		}
		const normalizedAmount = amount.trim();
		if (!normalizedAmount || Number.isNaN(Number(normalizedAmount))) {
			throw new Error('Unstake amount is invalid.');
		}

		const value = parseUnits(normalizedAmount, 18);
		if (value <= 0n) {
			throw new Error('Unstake amount must be greater than zero.');
		}

		return await new Promise<`0x${string}`>((resolve, reject) => {
			writeContract(
				{
					address: stakeContractAddress,
					abi: stakeAbi,
					functionName: 'unstake',
					chainId,
					args: [pid, value],
				},
				{
					onSuccess: resolve,
					onError: reject,
				}
			);
		});
	};

	return {
		address,
		unstake,
		hash,
		isPending,
		status,
		error,
		reset,
	};
}

export function useWithdraw() {
	const { address } = useAccount();
	const chainId = useChainId();
	const { writeContract, data: hash, isPending, error, reset, status } = useWriteContract();
	const withdraw = async (pid = 0n) => {
		if (!stakeContractAddress) {
			throw new Error('Stake contract address is not configured.');
		}
		if (!address) {
			throw new Error('Wallet not connected.');
		}

		return await new Promise<`0x${string}`>((resolve, reject) => {
			writeContract(
				{
					address: stakeContractAddress,
					abi: stakeAbi,
					functionName: 'withdraw',
					chainId,
					args: [pid],
				},
				{
					onSuccess: resolve,
					onError: reject,
				}
			);
		});
	};

	return {
		address,
		withdraw,
		hash,
		isPending,
		status,
		error,
		reset,
	};
}
