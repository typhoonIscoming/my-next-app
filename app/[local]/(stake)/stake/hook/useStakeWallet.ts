'use client';

import { useMemo } from 'react';
import { formatUnits, type Address } from 'viem';
import {
	useAccount,
	useBalance,
	useConnect,
	useDisconnect,
	useChainId,
	useSwitchChain,
} from 'wagmi';

export default function useStakeWallet() {
	const { address, isConnected, isConnecting, isReconnecting, connector, status } = useAccount();
	const {
		connectAsync,
		connectors,
		isPending: isConnectPending,
		error: connectError,
	} = useConnect();
	const { disconnect } = useDisconnect();
	const chainId = useChainId();
	const { switchChainAsync } = useSwitchChain();

	const effectiveChainId = chainId ?? undefined;

	const {
		data: balanceData,
		isLoading: isBalanceLoading,
		isFetching: isBalanceFetching,
		error: balanceError,
		refetch: refetchBalance,
	} = useBalance({
		address,
		chainId: effectiveChainId,
		query: {
			enabled: Boolean(address) && Boolean(effectiveChainId),
		},
	});
	const formattedBalance = useMemo(() => {
		if (!balanceData) {
			return '0';
		}
		return formatUnits(balanceData.value, balanceData.decimals);
	}, [balanceData]);
	// console.log('connectors', connectors);
	const connectMetaMask = async () => {
		const metaMaskConnector = connectors.find(
			(item) => item.id === 'metaMask' || item.name.toLowerCase().includes('metamask')
		);
		if (!metaMaskConnector) {
			throw new Error('MetaMask connector is not available.');
		}
		return connectAsync({ connector: metaMaskConnector });
	};

	const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

	return {
		address,
		shortAddress,
		connectorName: connector?.name ?? '',
		chainId,
		status,
		isConnected,
		isConnecting,
		isReconnecting,
		isConnectPending,
		connectError,
		balance: balanceData?.value ?? '',
		balanceSymbol: balanceData?.symbol ?? 'ETH',
		balanceDecimals: balanceData?.decimals ?? 18,
		formattedBalance,
		isBalanceLoading,
		isBalanceFetching,
		balanceError,
		connectMetaMask,
		disconnect,
		switchChainAsync,
		refetchBalance,
	};
}

export type UseStakeWallet = ReturnType<typeof useStakeWallet>;
export type StakeWalletAddress = Address;
