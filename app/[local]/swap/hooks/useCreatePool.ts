import type { Address } from 'viem';
import { useWriteContract } from 'wagmi';
import { poolManagerAddress } from '@/lib/utils';
import { poolManagerAbi } from './abi';

type CreateAndInitializePoolParams = {
	token0: Address;
	token1: Address;
	fee: bigint;
	tickLower: bigint;
	tickUpper: bigint;
	sqrtPriceX96: bigint;
};

export function useCreatePool() {
	const { writeContractAsync, isPending, error, reset, status, data } = useWriteContract();

	const createAndInitializePoolIfNecessary = async ({
		token0,
		token1,
		fee,
		tickLower,
		tickUpper,
		sqrtPriceX96,
	}: CreateAndInitializePoolParams) => {
		if (!poolManagerAddress) {
			throw new Error('PoolManager address is not configured.');
		}

		const [sortedToken0, sortedToken1] = [token0, token1].sort((a, b) =>
			a.toLowerCase() < b.toLowerCase() ? -1 : 1
		) as Address[];

		return writeContractAsync({
			address: poolManagerAddress,
			abi: poolManagerAbi,
			functionName: 'createAndInitializePoolIfNecessary',
			args: [
				{
					token0: sortedToken0,
					token1: sortedToken1,
					fee,
					tickLower,
					tickUpper,
					sqrtPriceX96,
				},
			],
		});
	};

	return {
		createAndInitializePoolIfNecessary,
		isPending,
		error,
		status,
		hash: data,
		reset,
	};
}
