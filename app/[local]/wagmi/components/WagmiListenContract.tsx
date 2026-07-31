import { useState, useEffect } from 'react';
import { useWatchContractEvent, usePublicClient, useBlockNumber } from 'wagmi';
// import { watchContractEvent } from 'wagmi';
import { erc20Abi, parseEther, PublicClient, formatUnits } from 'viem';
import { getContractEvents } from 'viem/actions';
import { sepoliaContractAddress } from '@/lib/utils';
import { config } from '../hooks/config';

export default function WagmiListenContract() {
	const [logs, setLogs] = useState<any>([]);

	const publicClient = usePublicClient();
	// const currentBlock = useBlockNumber();
	// console.log('currentBlock', currentBlock);
	const fetchRecentEvents = async () => {
		try {
			if (!publicClient) return;
			const currentBlock = await publicClient.getBlockNumber();
			console.log('currentBlockcurrentBlock', currentBlock);
			const logsRes = await getContractEvents(publicClient as PublicClient, {
				address: sepoliaContractAddress,
				abi: erc20Abi,
				eventName: 'Transfer',
				fromBlock: ((BigInt(currentBlock) as any) - BigInt(1000)) as any, // 或指定起始区块
				// toBlock: 'latest',
				toBlock: currentBlock as any,
				// retries: 3,
				// delay: 1000,
			});

			// 获取最近 100 条，并反转顺序（最新在前）
			const recentEvents = logsRes.slice(-100).reverse();
			console.log('logsRes', logsRes);
			setLogs(recentEvents);
		} catch (error) {
			console.error('获取事件失败:', error);
		}
	};
	// wagmi V1版本使用useContractEvents， V2已经没有了
	// const result = useContractEvents({
	// 	abi: erc20Abi,
	// 	address: sepoliaContractAddress,
	// 	eventName: 'Transfer',
	// });
	useWatchContractEvent({
		address: sepoliaContractAddress,
		abi: erc20Abi,
		eventName: 'Transfer',
		onLogs(logsRes) {
			console.log('New logs!', logsRes);
			setLogs((v: any) => {
				return v.concat(logsRes);
			});
		},
	});

	useEffect(() => {
		if (!publicClient) return;
		fetchRecentEvents();
	}, [publicClient]);
	const decimals = 18;
	return (
		<div className="border rounded-2xl p-4 space-y-3">
			<div>监听部署在测试网的合约事件</div>
			<div style={{ maxHeight: '300px', overflow: 'auto' }}>
				{logs.map((event: any, index: number) => {
					const { from, to, value } = event.args;
					const trans = formatUnits(value, decimals);
					return (
						<pre key={index}>
							from:{from} {`>`} to: {to} 转账 {trans}
						</pre>
					);
				})}
			</div>
		</div>
	);
}
