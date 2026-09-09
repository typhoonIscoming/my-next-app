import { useMemo } from 'react';
import { useReadPool } from './useReadPool';

export function usePoolFees(token0?: string, token1?: string) {
	const { data: pools = [] } = useReadPool();

	return useMemo(() => {
		if (!token0 || !token1) {
			return { fees: [] as number[] };
		}

		const normalizedToken0 = token0.toLowerCase();
		const normalizedToken1 = token1.toLowerCase();

		const uniqueFees = Array.from(
			new Set(
				(pools as Array<{ token0?: string; token1?: string; fee?: bigint | number }>)
					.filter((pool) => {
						if (!pool?.token0 || !pool?.token1) return false;
						const poolToken0 = pool.token0.toLowerCase();
						const poolToken1 = pool.token1.toLowerCase();
						return (
							(poolToken0 === normalizedToken0 && poolToken1 === normalizedToken1) ||
							(poolToken0 === normalizedToken1 && poolToken1 === normalizedToken0)
						);
					})
					.map((pool) => Number(pool.fee ?? 0))
					.filter((fee) => fee > 0)
			)
		) as number[];

		return {
			fees: uniqueFees
				.map((fee) => Number((fee / 10000).toFixed(4)))
				.filter((fee) => fee > 0)
				.sort((a, b) => a - b),
		};
	}, [pools, token0, token1]);
}
