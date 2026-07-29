// hooks/viem/useBalance.ts
import { useState, useEffect, useCallback } from 'react';
import { formatEther, parseEther, type Address } from 'viem';
import { useClients } from './useClients';
import { ERC20_ABI } from './config';

interface UseBalanceOptions {
	tokenAddress?: Address;
	refreshInterval?: number;
}

interface BalanceState {
	balance: string;
	formattedBalance: string;
	isLoading: boolean;
	error: Error | null;
}

export const useBalance = (
	address: Address | null | undefined,
	options: UseBalanceOptions = {}
) => {
	const { publicClient } = useClients();
	const [state, setState] = useState<BalanceState>({
		balance: '0',
		formattedBalance: '0',
		isLoading: false,
		error: null,
	});

	const fetchBalance = useCallback(async () => {
		if (!address) {
			setState((prev) => ({
				...prev,
				balance: '0',
				formattedBalance: '0',
			}));
			return;
		}

		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			if (options.tokenAddress) {
				// ERC20代币余额查询
				const balance = (await publicClient.readContract({
					address: options.tokenAddress,
					abi: ERC20_ABI,
					functionName: 'balanceOf',
					args: [address],
				})) as bigint;

				setState({
					balance: balance.toString(),
					formattedBalance: formatEther(balance),
					isLoading: false,
					error: null,
				});
			} else {
				// 原生ETH余额查询
				const balance = await publicClient.getBalance({ address });
				setState({
					balance: balance.toString(),
					formattedBalance: formatEther(balance),
					isLoading: false,
					error: null,
				});
			}
		} catch (error) {
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: error as Error,
			}));
		}
	}, [address, publicClient, options.tokenAddress]);

	// 自动刷新
	useEffect(() => {
		fetchBalance();

		if (options.refreshInterval) {
			const interval = setInterval(fetchBalance, options.refreshInterval);
			return () => clearInterval(interval);
		}
	}, [fetchBalance, options.refreshInterval]);

	return {
		...state,
		refetch: fetchBalance,
	};
};
