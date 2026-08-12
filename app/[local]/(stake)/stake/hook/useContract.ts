import { formatUnits } from 'viem';
import { sepolia } from 'wagmi/chains';
import { erc20Abi } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';
import { stakeContractAddress } from '@/lib/utils';

export default function useContract() {
	const { address } = useAccount();

	const result = useReadContracts({
		allowFailure: true,
		contracts: [
			{
				address: stakeContractAddress,
				abi: erc20Abi,
				functionName: 'name',
				chainId: sepolia.id,
			},
			{
				address: stakeContractAddress,
				abi: erc20Abi,
				functionName: 'symbol',
				chainId: sepolia.id,
			},
			{
				address: stakeContractAddress,
				abi: erc20Abi,
				functionName: 'decimals',
				chainId: sepolia.id,
			},
			{
				address: stakeContractAddress,
				abi: erc20Abi,
				functionName: 'totalSupply',
				chainId: sepolia.id,
			},
			...(address
				? [
						{
							address: stakeContractAddress,
							abi: erc20Abi,
							functionName: 'balanceOf',
							args: [address],
							chainId: sepolia.id,
						},
					]
				: []),
		],
	});

	const [nameCall, symbolCall, decimalsCall, totalSupplyCall, balanceCall] = result.data ?? [];

	const name = nameCall?.status === 'success' ? (nameCall.result as string) : '';
	const symbol = symbolCall?.status === 'success' ? (symbolCall.result as string) : 'ETH';
	const decimals = decimalsCall?.status === 'success' ? Number(decimalsCall.result) : 18;
	const totalSupply =
		totalSupplyCall?.status === 'success' ? (totalSupplyCall.result as bigint) : 0n;
	const balance = balanceCall?.status === 'success' ? (balanceCall.result as bigint) : 0n;

	return {
		address,
		contractAddress: stakeContractAddress,
		chainId: sepolia.id,
		name,
		symbol,
		decimals,
		totalSupply,
		formattedTotalSupply: formatUnits(totalSupply, decimals),
		balance,
		formattedBalance: formatUnits(balance, decimals),
		isLoading: result.isLoading,
		isFetching: result.isFetching,
		isError: result.isError,
		error: result.error,
		refetch: result.refetch,
	};
}
