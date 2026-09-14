import { renderHook } from '@testing-library/react';
import { useSwapPoolSelection } from '@/app/[local]/swap/hooks/useSwapPoolSelection';

describe('useSwapPoolSelection', () => {
	it('treats reverse-direction pool trade as valid based on pool order, not address sorting', () => {
		const { result } = renderHook(() => useSwapPoolSelection());
		const pool = {
			token0: '0x3333333333333333333333333333333333333333',
			token1: '0x1111111111111111111111111111111111111111',
			sqrtPriceX96: 4_295_128_738n,
		};

		expect(
			result.current.isPoolTradeableInDirection(
				pool,
				'0x1111111111111111111111111111111111111111',
				'0x3333333333333333333333333333333333333333'
			)
		).toBe(true);
	});

	it('uses a price limit above current price for reverse exact-output direction', () => {
		const { result } = renderHook(() => useSwapPoolSelection());
		const pool = {
			token0: '0x1111111111111111111111111111111111111111',
			token1: '0x3333333333333333333333333333333333333333',
		};

		const limit = result.current.getValidSqrtPriceLimitX96(
			1_000n,
			'0x3333333333333333333333333333333333333333',
			'0x1111111111111111111111111111111111111111',
			pool
		);

		expect(limit).toBeGreaterThan(1_000n);
	});

	it('keeps exact output required input as a real decimal instead of collapsing to zero', async () => {
		const { result } = renderHook(() => useSwapPoolSelection());
		const pool = {
			index: 2,
			token0: '0x1111111111111111111111111111111111111111',
			token1: '0x3333333333333333333333333333333333333333',
			sqrtPriceX96: 4_295_128_740n,
		};
		const quoteExactOutput = jest.fn().mockResolvedValue(1_234_567_890n);

		const output = await result.current.getBestPoolForExactOutput({
			candidatePools: [pool],
			tokenIn: '0x3333333333333333333333333333333333333333',
			tokenOut: '0x1111111111111111111111111111111111111111',
			amountOut: '1',
			quoteExactOutput,
		});

		expect(output).toMatchObject({
			pool,
			amountIn: '0.00000000123456789',
		});
		expect(quoteExactOutput).toHaveBeenCalledWith(
			expect.objectContaining({
				tokenIn: '0x3333333333333333333333333333333333333333',
				tokenOut: '0x1111111111111111111111111111111111111111',
			})
		);
	});
});
