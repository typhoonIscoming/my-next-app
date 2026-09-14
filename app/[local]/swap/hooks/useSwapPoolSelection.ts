import { useCallback } from 'react';
import { formatUnits, type Address } from 'viem';

const MIN_SQRT_PRICE_X96 = 4_295_128_739n;
const MAX_SQRT_PRICE_X96 = 146_144_670_348_521_010_328_727_305_220_398_882_237_184_430n;

export function useSwapPoolSelection() {
	const getZeroForOneInPool = useCallback(
		(pool: { token0: string; token1: string }, tokenIn: Address, tokenOut: Address) => {
			const a = tokenIn.toLowerCase();
			const b = tokenOut.toLowerCase();
			const p0 = pool.token0.toLowerCase();
			const p1 = pool.token1.toLowerCase();

			if (a === p0 && b === p1) return true;
			if (a === p1 && b === p0) return false;

			return a < b;
		},
		[]
	);

	const getValidSqrtPriceLimitX96 = useCallback(
		(
			currentSqrtPriceX96: bigint | undefined,
			tokenIn: Address,
			tokenOut: Address,
			pool?: { token0: string; token1: string }
		) => {
			const price = currentSqrtPriceX96 ?? MIN_SQRT_PRICE_X96 + 1n;
			const zeroForOne = pool
				? getZeroForOneInPool(pool, tokenIn, tokenOut)
				: tokenIn.toLowerCase() < tokenOut.toLowerCase();
			const slippageRatio = zeroForOne ? 95n : 105n;
			const limit = (price * slippageRatio) / 100n;

			if (zeroForOne) {
				return limit > MIN_SQRT_PRICE_X96 ? limit : MIN_SQRT_PRICE_X96 + 1n;
			}

			return limit < MAX_SQRT_PRICE_X96 ? limit : MAX_SQRT_PRICE_X96 - 1n;
		},
		[getZeroForOneInPool]
	);

	const isPoolMatch = useCallback(
		(pool: { token0: string; token1: string }, tokenA: Address, tokenB: Address) => {
			const a = tokenA.toLowerCase();
			const b = tokenB.toLowerCase();
			const p0 = pool.token0.toLowerCase();
			const p1 = pool.token1.toLowerCase();

			return (p0 === a && p1 === b) || (p0 === b && p1 === a);
		},
		[]
	);

	const isPoolTradeableInDirection = useCallback(
		(
			pool: { token0: string; token1: string; sqrtPriceX96?: bigint | string | number },
			tokenIn: Address,
			tokenOut: Address
		) => {
			const currentPrice = BigInt(pool.sqrtPriceX96 ?? 0);
			const zeroForOne = getZeroForOneInPool(pool, tokenIn, tokenOut);

			if (zeroForOne) {
				return currentPrice > MIN_SQRT_PRICE_X96;
			}

			return currentPrice < MAX_SQRT_PRICE_X96;
		},
		[getZeroForOneInPool]
	);

	const getBestPoolForExactInput = useCallback(
		async ({
			candidatePools,
			tokenIn,
			tokenOut,
			amountIn,
			quoteExactInput,
		}: {
			candidatePools: any[];
			tokenIn: Address;
			tokenOut: Address;
			amountIn: string;
			quoteExactInput: (args: {
				tokenIn: Address;
				tokenOut: Address;
				indexPath: number;
				amountIn: string;
				sqrtPriceLimitX96?: bigint;
			}) => Promise<bigint>;
		}) => {
			const validPools = candidatePools.filter(
				(pool: {
					token0: string;
					token1: string;
					sqrtPriceX96?: bigint | string | number;
				}) =>
					isPoolMatch(pool, tokenIn, tokenOut) &&
					isPoolTradeableInDirection(pool, tokenIn, tokenOut)
			);

			if (validPools.length === 0) {
				return null;
			}

			let bestPool: any = null;
			let bestAmountOut = 0n;

			for (const pool of validPools) {
				try {
					const amountOut = await quoteExactInput({
						tokenIn,
						tokenOut,
						indexPath: Number(pool.index),
						amountIn,
						sqrtPriceLimitX96: getValidSqrtPriceLimitX96(
							BigInt(pool.sqrtPriceX96 ?? 0),
							tokenIn,
							tokenOut,
							pool
						),
					});

					if (amountOut > bestAmountOut) {
						bestAmountOut = amountOut;
						bestPool = pool;
					}
				} catch (error) {
					console.warn('quoteExactInput failed for pool, skipping:', pool, error);
					continue;
				}
			}

			const amountOut = Number(formatUnits(bestAmountOut, 18));
			const flooredAmountOut = Math.floor(amountOut * 100) / 100;

			return {
				pool: bestPool,
				amountOut: flooredAmountOut.toFixed(2),
			};
		},
		[getValidSqrtPriceLimitX96, isPoolMatch, isPoolTradeableInDirection]
	);

	const getBestPoolForExactOutput = useCallback(
		async ({
			candidatePools,
			tokenIn,
			tokenOut,
			amountOut,
			quoteExactOutput,
		}: {
			candidatePools: any[];
			tokenIn: Address;
			tokenOut: Address;
			amountOut: string;
			quoteExactOutput: (args: {
				tokenIn: Address;
				tokenOut: Address;
				poolIndex: number;
				amountOut: string;
				sqrtPriceLimitX96: bigint;
			}) => Promise<bigint>;
		}) => {
			const validPools = candidatePools.filter(
				(pool: {
					token0: string;
					token1: string;
					sqrtPriceX96?: bigint | string | number;
				}) =>
					isPoolMatch(pool, tokenIn, tokenOut) &&
					isPoolTradeableInDirection(pool, tokenIn, tokenOut)
			);

			if (validPools.length === 0) {
				return null;
			}

			let bestPool: any = null;
			let bestAmountIn = 2n ** 256n - 1n;

			for (const pool of validPools) {
				try {
					const requiredAmountIn = await quoteExactOutput({
						tokenIn,
						tokenOut,
						poolIndex: Number(pool.index),
						amountOut,
						sqrtPriceLimitX96: getValidSqrtPriceLimitX96(
							BigInt(pool.sqrtPriceX96 ?? 0),
							tokenIn,
							tokenOut,
							pool
						),
					});
					console.log('requiredAmountIn', requiredAmountIn);
					if (requiredAmountIn < bestAmountIn) {
						bestAmountIn = requiredAmountIn;
						bestPool = pool;
					}
				} catch (error) {
					console.warn('quoteExactOutput failed for pool, skipping:', pool, error);
					continue;
				}
			}
			const amountIn = formatUnits(bestAmountIn, 18);
			return {
				pool: bestPool,
				amountIn,
			};
		},
		[getValidSqrtPriceLimitX96, isPoolMatch, isPoolTradeableInDirection]
	);

	return {
		getValidSqrtPriceLimitX96,
		isPoolMatch,
		isPoolTradeableInDirection,
		getBestPoolForExactInput,
		getBestPoolForExactOutput,
	};
}
