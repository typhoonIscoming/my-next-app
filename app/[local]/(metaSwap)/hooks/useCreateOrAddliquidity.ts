import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { toChainTokenAddress } from '@/lib/utils';
import type { Token } from '../liquidity/types';

export default function useCreateOrAddliquidity({
	amount0,
	amount1,
	token0,
	token1,
	selectedFee,
	initialPrice,
	token0SupportsPermit,
	token1SupportsPermit,
}: {
	amount0: string;
	amount1: string;
	token0: Token | null;
	token1: Token | null;
	selectedFee: number | null;
	initialPrice: string;
	token0SupportsPermit: boolean;
	token1SupportsPermit: boolean;
}) {
	const { address } = useAccount();
	return useCallback(() => {
		if (!address || !amount0 || !amount1 || !token0 || !token1) return;
		try {
			const amountWei0 = parseUnits(amount0, token0.decimals);
			const amountWei1 = parseUnits(amount1, token1.decimals);
			const actualToken0Address = toChainTokenAddress(token0.address);
			const actualToken1Address = toChainTokenAddress(token1.address);

			// 确保 token0 地址小于 token1 地址，并同步对应 metadata（name/permit）
			let sortedToken0Address = actualToken0Address;
			let sortedToken1Address = actualToken1Address;
			let sortedAmount0 = amountWei0;
			let sortedAmount1 = amountWei1;
			let sortedToken0Name = token0.name;
			let sortedToken1Name = token1.name;
			let sortedToken0SupportsPermit = token0SupportsPermit;
			let sortedToken1SupportsPermit = token1SupportsPermit;

			if (BigInt(actualToken0Address) > BigInt(actualToken1Address)) {
				sortedToken0Address = actualToken1Address;
				sortedToken1Address = actualToken0Address;
				sortedAmount0 = amountWei1;
				sortedAmount1 = amountWei0;
				sortedToken0Name = token1.name;
				sortedToken1Name = token0.name;
				sortedToken0SupportsPermit = token1SupportsPermit;
				sortedToken1SupportsPermit = token0SupportsPermit;
			}
			const sortedToken0Decimals =
				BigInt(actualToken0Address) > BigInt(actualToken1Address)
					? token1.decimals
					: token0.decimals;
			const sortedToken1Decimals =
				BigInt(actualToken0Address) > BigInt(actualToken1Address)
					? token0.decimals
					: token1.decimals;
		} catch (error) {
			console.error(error);
		}
	}, [
		address,
		amount0,
		amount1,
		token0,
		token1,
		selectedFee,
		initialPrice,
		token0SupportsPermit,
		token1SupportsPermit,
	]);
}
