import { useReadContract } from 'wagmi';
import { postionsAbi } from './abi';
import { positionsAddress } from '@/lib/utils';

export function useReadPositions() {
	const {
		data,
		isLoading,
		refetch: contractRefetch,
	} = useReadContract({
		abi: postionsAbi,
		address: positionsAddress,
		functionName: 'getAllPositions',
	});

	// 获取我创建的流动池
	const refetch = async () => {
		await contractRefetch();
	};

	return { data, isLoading, refetch };
}
