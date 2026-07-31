import { usePublicClient } from 'wagmi';
import { erc20Abi } from 'viem';
import { getContractEvents } from 'viem/actions';
import { useEffect, useState } from 'react';
import { sepoliaContractAddress } from '@/lib/utils';

// 计算指定天数前的区块号
async function getBlockNumberFromDaysAgo(publicClient: any, daysAgo: number): Promise<bigint> {
	// 1. 获取当前区块
	const currentBlock = await publicClient.getBlockNumber();

	// 2. 获取当前区块的时间戳
	const currentBlockData = await publicClient.getBlock({
		blockNumber: currentBlock,
	});
	const currentTimestamp = Number(currentBlockData.timestamp);

	// 3. 计算目标时间戳（当前时间 - N天）
	const targetTimestamp = currentTimestamp - daysAgo * 24 * 60 * 60;

	// 4. 二分查找目标区块
	let low = BigInt(0);
	let high = currentBlock;
	let targetBlock = currentBlock;

	while (low <= high) {
		const mid = (low + high) / 2n;
		const block = await publicClient.getBlock({ blockNumber: mid });
		const blockTime = Number(block.timestamp);

		if (blockTime >= targetTimestamp) {
			targetBlock = mid;
			high = mid - 1n;
		} else {
			low = mid + 1n;
		}
	}

	return targetBlock;
}

export function useEventFetcher() {
	const publicClient = usePublicClient();
	const [events, setEvents] = useState<any>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!publicClient) return;

		const fetchEvents = async () => {
			try {
				// ✅ 获取 7 天前的区块号
				const fromBlock = await getBlockNumberFromDaysAgo(publicClient, 7);
				const currentBlock = await publicClient.getBlockNumber();

				console.log(`查询范围: ${fromBlock} -> ${currentBlock}`);
				console.log(`约 ${Number(currentBlock - fromBlock)} 个区块`);

				const logs = await getContractEvents(publicClient, {
					address: sepoliaContractAddress,
					abi: erc20Abi,
					eventName: 'Transfer',
					fromBlock: currentBlock - 9999n,
					toBlock: 'latest',
				});

				const recentEvents = logs.slice(-100).reverse();
				setEvents(recentEvents);
				setLoading(false);
			} catch (error) {
				console.error('获取事件失败:', error);
				setLoading(false);
			}
		};

		fetchEvents();
	}, [publicClient]);
	return {
		events,
		loading,
	};
}
