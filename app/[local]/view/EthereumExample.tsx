// components/EthereumExample.tsx
'use client';
import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import {
	useEthBalance,
	useSendEth,
	useTokenBalance,
	useTokenTransferEvents,
} from './useEthereum';
import { Button } from '@/components/ui/button';
import useIsMounted from '@/hooks/useIsMounted';

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
// const USDC_ADDRESS = process.env.PRIVATE_KEY;

export default function EthereumExample() {
	const { address, isConnected } = useAccount();
	const { connect, connectors } = useConnect();
	const { disconnect } = useDisconnect();

	const [recipient, setRecipient] = useState('');
	const [amount, setAmount] = useState('');
	const [transferLogs, setTransferLogs] = useState<any[]>([]);
	const isMounted = useIsMounted();

	// 使用 Hooks
	const { balance: ethBalance, isLoading: ethLoading } = useEthBalance();
	const { sendEth, hash: txHash, isLoading: sendingEth } = useSendEth();
	const { formattedBalance: usdcBalance, isLoading: usdcLoading } =
		useTokenBalance({
			tokenAddress: USDC_ADDRESS as `0x${string}`,
		});

	// 监听 Transfer 事件
	useTokenTransferEvents({
		tokenAddress: USDC_ADDRESS as `0x${string}`,
		onTransfer: (from, to, value) => {
			setTransferLogs((prev) => [
				...prev,
				{ from, to, value: value.toString(), timestamp: new Date() },
			]);
		},
	});

	const handleSendEth = async () => {
		if (!recipient || !amount) return;
		try {
			await sendEth(recipient as `0x${string}`, amount);
			setRecipient('');
			setAmount('');
		} catch (error) {
			console.error('发送失败:', error);
		}
	};

	// 🔥 关键：使用 useIsMounted 防止水合错误
	// 服务端渲染时返回加载状态或占位符
	if (!isMounted) {
		return (
			<div className="p-4">
				<div className="animate-pulse">
					<div className="h-10 bg-gray-200 rounded w-32 mb-4"></div>
					<div className="space-y-3">
						<div className="h-20 bg-gray-100 rounded"></div>
						<div className="h-20 bg-gray-100 rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	if (!isConnected) {
		console.log('connectors', connectors);
		return (
			<div className="mt-4">
				<button
					onClick={() => connect({ connector: connectors[0] })}
					className="bg-blue-500 text-white px-4 py-2 rounded"
				>
					连接钱包
				</button>
			</div>
		);
	}

	return (
		<div className="p-4 space-y-6">
			{/* 连接信息 */}
			<div className="flex justify-between items-center">
				<div>
					<p className="font-semibold">已连接地址:</p>
					<p className="text-sm text-gray-600">{address}</p>
				</div>
				<button
					onClick={() => disconnect()}
					className="bg-red-500 text-white px-4 py-2 rounded"
				>
					断开连接
				</button>
			</div>

			{/* 查询余额 */}
			<div className="border p-4 rounded-lg">
				<h3 className="font-bold mb-2">💰 余额查询</h3>
				<div className="space-y-2">
					<div>
						<span className="font-medium">ETH 余额: </span>
						{ethLoading ? '加载中...' : `${ethBalance} ETH`}
					</div>
					<div>
						<span className="font-medium">USDC 余额: </span>
						{usdcLoading ? '加载中...' : `${usdcBalance} USDC`}
					</div>
				</div>
			</div>

			{/* 发送 ETH */}
			<div className="border p-4 rounded-lg">
				<h3 className="font-bold mb-2">💸 发送 ETH</h3>
				<div className="space-y-3">
					<input
						type="text"
						placeholder="接收地址 (0x...)"
						value={recipient}
						onChange={(e) => setRecipient(e.target.value)}
						className="w-full border p-2 rounded"
					/>
					<input
						type="text"
						placeholder="金额 (ETH)"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						className="w-full border p-2 rounded"
					/>
					<Button
						onClick={handleSendEth}
						disabled={sendingEth || !recipient || !amount}
						className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
					>
						{sendingEth ? '发送中...' : '发送 ETH'}
					</Button>
					{txHash && (
						<div className="text-sm text-green-600">
							交易已发送: {txHash.slice(0, 10)}...
							{txHash.slice(-8)}
						</div>
					)}
				</div>
			</div>

			{/* 监听事件 */}
			<div className="border p-4 rounded-lg">
				<h3 className="font-bold mb-2">📡 实时 Transfer 事件</h3>
				<div className="h-40 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
					{transferLogs.length === 0 ? (
						<p className="text-gray-400">等待 Transfer 事件...</p>
					) : (
						transferLogs.map((log, index) => (
							<div
								key={index}
								className="border-b border-gray-200 py-1"
							>
								<div>
									从: {log.from.slice(0, 10)}...
									{log.from.slice(-8)}
								</div>
								<div>
									到: {log.to.slice(0, 10)}...
									{log.to.slice(-8)}
								</div>
								<div>金额: {log.value}</div>
								<div className="text-gray-400 text-xs">
									{log.timestamp.toLocaleTimeString()}
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
