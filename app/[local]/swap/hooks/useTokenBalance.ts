import { useMemo } from 'react';
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
	const isNativeToken =
		!tokenAddress || tokenAddress === '0x0000000000000000000000000000000000000000';

	const nativeBalanceQuery = useBalance({
		address,
		query: {
			enabled: !!address && isNativeToken,
		},
	});

	const { data: tokenBytecode } = useBytecode({
		address: tokenAddress as Address | undefined,
		query: {
			enabled: !!tokenAddress && !isNativeToken,
		},
	});

	const hasContractCode = !!tokenAddress && !!tokenBytecode && tokenBytecode !== '0x';

	const erc20BalanceQuery = useReadContract({
		address: tokenAddress as Address,
		abi: erc20Abi,
		functionName: 'balanceOf',
		args: address && tokenAddress ? [address] : undefined,
		query: {
			enabled: !!address && !!tokenAddress && !isNativeToken && hasContractCode,
		},
	});

	const balance = useMemo(() => {
		if (!address) return 0n;
		if (isNativeToken) return nativeBalanceQuery.data?.value ?? 0n;
		if (!hasContractCode) return 0n;
		return (erc20BalanceQuery.data as bigint | undefined) ?? 0n;
	}, [address, hasContractCode, isNativeToken, nativeBalanceQuery.data, erc20BalanceQuery.data]);

	const decimals = options.decimals ?? 18;

	return {
		address,
		tokenAddress: tokenAddress ?? null,
		isNativeToken,
		hasContractCode,
		balance,
		formatted: formatUnits(balance, decimals),
		isLoading: isNativeToken ? nativeBalanceQuery.isLoading : erc20BalanceQuery.isLoading,
		isError: isNativeToken ? !!nativeBalanceQuery.error : !!erc20BalanceQuery.error,
		refetch: isNativeToken ? nativeBalanceQuery.refetch : erc20BalanceQuery.refetch,
	};
}
