import { useReadContract } from 'wagmi';
import { postionsAbi } from './abi';
import { positionsAddress } from '@/lib/utils';

export function useReadPositions() {
	// refetch
	const {
		data,
		isLoading,
		refetch: contractRefetch,
	} = useReadContract({
		// contract configuration here
		abi: postionsAbi,
		address: positionsAddress,
		functionName: 'getAllPositions', // replace with the actual function name in your contract
	});

	// 获取我创建的流动池
	const refetch = async () => {
		await contractRefetch();
	};

	return { data, isLoading, refetch };
}
