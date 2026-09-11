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
			poolIndex,
			amountIn,
			decimals = 18,
		}: {
			tokenIn: Address;
			tokenOut: Address;
			poolIndex: number;
			amountIn: string;
			decimals?: number;
		}) => {
			if (!publicClient) return 0n;

			return (await publicClient.readContract({
				address: swapAddress,
				abi: swapRouterAbi,
				functionName: 'quoteExactInput',
				args: [
					{
						tokenIn,
						tokenOut,
						indexPath: [poolIndex],
						amountIn: parseUnits(amountIn, decimals),
						sqrtPriceLimitX96: 0n,
					},
				],
			})) as bigint;
		},
		[publicClient]
	);

	const quoteExactOutput = useCallback(
		async ({
			tokenIn,
			tokenOut,
			poolIndex,
			amountOut,
			decimals = 18,
		}: {
			tokenIn: Address;
			tokenOut: Address;
			poolIndex: number;
			amountOut: string;
			decimals?: number;
		}) => {
			if (!publicClient) return 0n;

			return (await publicClient.readContract({
				address: swapAddress,
				abi: swapRouterAbi,
				functionName: 'quoteExactOutput',
				args: [
					{
						tokenIn,
						tokenOut,
						indexPath: [poolIndex],
						amountOut: parseUnits(amountOut, decimals),
						sqrtPriceLimitX96: 0n,
					},
				],
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
