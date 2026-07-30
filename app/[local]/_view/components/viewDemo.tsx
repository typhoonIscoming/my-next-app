'use client';
import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useBalance } from '../hooks/useBalance';
import { useTransfer } from '../hooks/useTransfer';
// import { useContractEvents } from '../hooks/useContractEvents';
import { ERC20_ABI } from '../hooks/config';
import { Button } from '@/components/ui/button';

const TOKEN_ADDRESS = process.env
	.NEXT_PUBLIC_SOPOLIA_ADDRESS_WETH as `0x${string}`; // 你的代币合约地址

export default () => {
	const { address, isConnected, connect, disconnect } = useWallet();
	const {
		balance,
		formattedBalance,
		isLoading: balanceLoading,
	} = useBalance(address);
	const { transfer, isPending, hash, error } = useTransfer();
	const [toAddress, setToAddress] = useState('');
	const [amount, setAmount] = useState('');

	// 监听转账事件
	// const { events, isLoading: eventsLoading } = useContractEvents({
	// 	address: TOKEN_ADDRESS,
	// 	abi: ERC20_ABI,
	// 	eventName: 'Transfer',
	// 	args: { from: address },
	// 	enabled: !!address,
	// });

	const handleTransfer = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await transfer({
				to: toAddress as `0x${string}`,
				amount,
				tokenAddress: TOKEN_ADDRESS,
			});
			setToAddress('');
			setAmount('');
		} catch (err) {
			console.error('转账失败:', err);
		}
	};
	// 防止水合
	if (!isConnected) {
		return (
			<Button onClick={connect} className="btn-primary">
				连接钱包
			</Button>
		);
	}

	return (
		<div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-bold">代币转账</h2>
				<Button onClick={disconnect} className="text-sm text-red-500">
					断开连接
				</Button>
			</div>

			<div className="mb-4">
				<p className="text-sm text-gray-600">钱包地址</p>
				<p className="font-mono text-sm">{address}</p>
			</div>

			<div className="mb-4">
				<p className="text-sm text-gray-600">余额</p>
				{balanceLoading ? (
					<p>加载中...</p>
				) : (
					<p className="text-2xl font-bold">{formattedBalance} ETH</p>
				)}
			</div>

			<form onSubmit={handleTransfer} className="space-y-4">
				<div>
					<label className="block text-sm font-medium text-gray-700">
						接收地址
					</label>
					<input
						type="text"
						value={toAddress}
						onChange={(e) => setToAddress(e.target.value)}
						placeholder="0x..."
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
						required
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">
						金额 (ETH)
					</label>
					<input
						type="number"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder="0.0"
						step="0.001"
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
						required
					/>
				</div>

				<button
					type="submit"
					disabled={isPending}
					className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
				>
					{isPending ? '转账中...' : '转账'}
				</button>
			</form>

			{hash && (
				<div className="mt-4 p-3 bg-green-50 rounded-md">
					<p className="text-sm text-green-600">转账成功!</p>
					<p className="text-xs font-mono break-all">
						交易Hash: {hash}
					</p>
				</div>
			)}

			{error && (
				<div className="mt-4 p-3 bg-red-50 rounded-md">
					<p className="text-sm text-red-600">
						转账失败: {error.message}
					</p>
				</div>
			)}

			{/* 事件监听展示 */}
			{/* {events.length > 0 && (
				<div className="mt-6">
					<h3 className="text-lg font-semibold mb-2">转账记录</h3>
					<div className="space-y-2 max-h-40 overflow-y-auto">
						{events.map((event, index) => (
							<div
								key={index}
								className="text-sm bg-gray-50 p-2 rounded"
							>
								<p>从: {event.args.from}</p>
								<p>到: {event.args.to}</p>
								<p>金额: {event.args.value.toString()}</p>
								<p className="text-xs text-gray-500">
									区块: {event.blockNumber.toString()}
								</p>
							</div>
						))}
					</div>
				</div>
			)} */}
		</div>
	);
};
