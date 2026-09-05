import { useReadContract } from 'wagmi';
import { postionsAbi } from './abi';
import { positionsAddress } from '@/lib/utils';

export function useReadPositions() {
	return useReadContract({
		// contract configuration here
		abi: postionsAbi,
		address: positionsAddress,
		functionName: 'getAllPositions', // replace with the actual function name in your contract
	});
}
