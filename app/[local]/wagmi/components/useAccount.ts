import { useAccount, useBalance } from 'wagmi';
import { type Address } from 'viem';
import { mainnet } from 'viem/chains';

export default function useEthBalance(address?: Address) {
	const { address: connectedAddress } = useAccount();
	const targetAddress = address || connectedAddress;

	const { data, isLoading, error, refetch } = useBalance({
		address: targetAddress,
		chainId: mainnet.id,
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
