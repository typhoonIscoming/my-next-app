import { useAccount, useBalance, useChainId } from 'wagmi';
import { type Address } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { config } from './config';

export default function useEthBalance(address?: Address) {
	const { address: connectedAddress } = useAccount();
	const targetAddress = address || connectedAddress;
	// console.log('config', config);
	const chainId = useChainId({
		config,
	});
	const { data, isLoading, error, refetch } = useBalance({
		address: targetAddress,
		chainId: chainId,
	});

	return {
		balance: data?.formatted ?? '0',
		symbol: data?.symbol ?? 'ETH',
		decimals: data?.decimals ?? 18,
		rawBalance: data?.value,
		isLoading,
		error,
		targetAddress,
		refetch,
	};
}
