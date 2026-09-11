import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { type Address, erc20Abi, formatUnits } from 'viem';
import { useAccount, useBalance, useBytecode, useReadContract } from 'wagmi';

export type UseTokenBalanceOptions = {
	decimals?: number;
};

export function useTokenBalance(
	tokenAddress?: Address | null,
	options: UseTokenBalanceOptions = {}
) {
	const { address } = useAccount();
	const [loadingMinMs, setLoadingMinMs] = useState(false);
	const loadingStartRef = useRef<number | null>(null);
	// const isNativeToken =
	// 	!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000';

	const nativeBalanceQuery = useBalance({
		address,
		query: {
			enabled: !!address,
		},
	});

	const { data: tokenBytecode } = useBytecode({
		address: tokenAddress as Address | undefined,
		query: {
			enabled: !!tokenAddress,
		},
	});

	const hasContractCode = !!tokenAddress && !!tokenBytecode && tokenBytecode !== '0x';

	const erc20BalanceQuery = useReadContract({
		address: tokenAddress as Address,
		abi: erc20Abi,
		functionName: 'balanceOf',
		args: address && tokenAddress ? [address] : undefined,
		query: {
			enabled: !!address && !!tokenAddress && hasContractCode,
		},
	});

	const balance = useMemo(() => {
		if (!address) return 0n;
		// if (isNativeToken) return nativeBalanceQuery.data?.value ?? 0n;
		if (!hasContractCode) return 0n;
		return (erc20BalanceQuery.data as bigint | undefined) ?? 0n;
	}, [address, hasContractCode, nativeBalanceQuery.data, erc20BalanceQuery.data]);

	const decimals = options.decimals ?? 18;
	const baseIsLoading =
		// isNativeToken
		// 	? nativeBalanceQuery.isLoading
		// 	:
		erc20BalanceQuery.isLoading;

	useEffect(() => {
		if (!baseIsLoading) {
			if (loadingStartRef.current !== null) {
				const elapsed = Date.now() - loadingStartRef.current;
				if (elapsed < 1000) {
					const remaining = 1000 - elapsed;
					const timer = setTimeout(() => setLoadingMinMs(false), remaining);
					return () => clearTimeout(timer);
				}
			}
			setLoadingMinMs(false);
			loadingStartRef.current = null;
			return;
		}

		if (loadingStartRef.current === null) {
			loadingStartRef.current = Date.now();
		}
		setLoadingMinMs(true);
	}, [baseIsLoading]);

	const refetch = useCallback(async () => {
		loadingStartRef.current = Date.now();
		setLoadingMinMs(true);
		const result =
			// isNativeToken
			// 	? await nativeBalanceQuery.refetch()
			// 	:
			await erc20BalanceQuery.refetch();
		const elapsed = Date.now() - (loadingStartRef.current ?? Date.now());
		if (elapsed < 1000) {
			await new Promise((resolve) => setTimeout(resolve, 1000 - elapsed));
		}
		setLoadingMinMs(false);
		loadingStartRef.current = null;
		return result;
	}, [erc20BalanceQuery.refetch]);

	return {
		address,
		tokenAddress: tokenAddress ?? null,
		// isNativeToken,
		hasContractCode,
		balance,
		formatted: formatUnits(balance, decimals),
		isLoading: baseIsLoading || loadingMinMs,
		isError:
			// isNativeToken ? !!nativeBalanceQuery.error :
			!!erc20BalanceQuery.error,
		refetch,
	};
}
