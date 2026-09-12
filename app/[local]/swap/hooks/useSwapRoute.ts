import { useCallback } from 'react';
import { parseUnits, type Address } from 'viem';
import { usePublicClient } from 'wagmi';
import { poolManagerAbi, swapRouterAbi } from './abi';
import { poolManagerAddress, swapAddress } from '@/lib/utils';

export function useSwapRoute() {
	const publicClient = usePublicClient();

	const getCandidatePools = useCallback(
		async (token0: Address) => {
			if (!publicClient) return [] as any[];

			const pools = (await publicClient.readContract({
				address: poolManagerAddress,
				abi: poolManagerAbi,
				functionName: 'getAllPools',
			})) as any[];
			console.log('getCandidatePools pools', pools);
			return pools.filter(
				(pool) =>
					pool.token0.toLowerCase() === token0.toLowerCase() ||
					pool.token1.toLowerCase() === token0.toLowerCase()
			);
		},
		[publicClient]
	);

	const quoteExactInput = useCallback(
		async ({
			tokenIn,
			tokenOut,
			indexPath,
			amountIn,
			sqrtPriceLimitX96,
		}: {
			tokenIn: Address;
			tokenOut: Address;
			indexPath: number;
			amountIn: string;
			sqrtPriceLimitX96?: BigInt;
		}) => {
			if (!publicClient) return 0n;
			const params = {
				tokenIn,
				tokenOut,
				indexPath: [indexPath],
				amountIn: parseUnits(amountIn, 18),
				sqrtPriceLimitX96: sqrtPriceLimitX96 ?? 0n,
			};

			const result = (await publicClient.readContract({
				address: swapAddress,
				abi: swapRouterAbi,
				functionName: 'quoteExactInput',
				args: [params],
			})) as bigint;
			console.log('quoteExactInput params', params, 'result', result);
			return result;
		},
		[publicClient]
	);

	const quoteExactOutput = useCallback(
		async ({
			tokenIn,
			tokenOut,
			poolIndex,
			amountOut,
			sqrtPriceLimitX96,
		}: {
			tokenIn: Address;
			tokenOut: Address;
			poolIndex: number;
			amountOut: string;
			sqrtPriceLimitX96: BigInt;
		}) => {
			if (!publicClient) return 0n;
			const arg = {
				tokenIn,
				tokenOut,
				indexPath: [poolIndex],
				amount: parseUnits(amountOut, 18),
				sqrtPriceLimitX96: sqrtPriceLimitX96 ?? 0n,
			};
			console.log('args', arg);
			return (await publicClient.readContract({
				address: swapAddress,
				abi: swapRouterAbi,
				functionName: 'quoteExactOutput',
				args: [arg],
			})) as bigint;
		},
		[publicClient]
	);

	return {
		getCandidatePools,
		quoteExactInput,
		quoteExactOutput,
	};
}
