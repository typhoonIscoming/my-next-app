import { useReadContract } from 'wagmi';
import { poolManagerAbi } from './abi';
import { poolManagerAddress } from '@/lib/utils';

export const useReadPool = () => {
	return useReadContract({
		address: poolManagerAddress,
		abi: poolManagerAbi,
		functionName: 'getAllPools',
	});
};
