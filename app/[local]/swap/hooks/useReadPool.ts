import { useReadContract } from 'wagmi';
import { erc20Abi } from 'viem';
import { poolManagerAbi } from './abi';
import { poolManagerAddress } from '@/lib/utils';

export const useReadPool = () => {
	return useReadContract({
		address: poolManagerAddress,
		abi: poolManagerAbi,
		functionName: 'getAllPools',
	});
};

export const useReadToken = (tokenAddress: `0x${string}`) => {
	const { data, isLoading, error, refetch } = useReadContract({
		address: tokenAddress,
		abi: erc20Abi,
		functionName: 'decimals',
	});
	return { data, isLoading, error, refetch };
};
