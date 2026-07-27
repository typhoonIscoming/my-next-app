'use client';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useMetaMask } from '../hooks/useMetaMask';
import { useContract } from '../hooks/useContract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ERC20 示例 ABI
const ERC20_ABI = [
	'function name() view returns (string)',
	'function symbol() view returns (string)',
	'function decimals() view returns (uint8)',
	'function totalSupply() view returns (uint256)',
	'function balanceOf(address) view returns (uint256)',
	'function transfer(address to, uint256 amount) returns (bool)',
	'function approve(address spender, uint256 amount) returns (bool)',
	'event Transfer(address indexed from, address indexed to, uint256 value)',
];

export default function App() {
	const {
		isConnected,
		address,
		balance,
		provider,
		signer,
		isLoading: isWalletLoading,
		error: walletError,
		connect,
		disconnect,
		refreshBalance,
	} = useMetaMask();

	const [tokenAddress, setTokenAddress] = useState(
		'0x4307f08b5857363d8c8e7d21d97ddc769f65990a'
	);

	// 初始化合约（只读）
	const readOnlyContract = useContract(
		{ address: tokenAddress, abi: ERC20_ABI },
		provider
	);

	// 初始化合约（读写）
	const readWriteContract = useContract(
		{ address: tokenAddress, abi: ERC20_ABI },
		signer
	);

	const [tokenInfo, setTokenInfo] = useState<{
		name?: string;
		symbol?: string;
		totalSupply?: string;
		balance?: string;
	}>({});

	const [events, setEvents] = useState<any[]>([]);

	// 查询代币信息
	const fetchTokenInfo = async () => {
		if (!readOnlyContract.isReady) return;

		try {
			const [name, symbol, decimals, totalSupply, balance] =
				await Promise.all([
					readOnlyContract.read<string>('name'),
					readOnlyContract.read<string>('symbol'),
					readOnlyContract.read<number>('decimals'),
					readOnlyContract.read<bigint>('totalSupply'),
					address
						? readOnlyContract.read<bigint>('balanceOf', [address])
						: Promise.resolve(BigInt(0)),
				]);

			setTokenInfo({
				name,
				symbol,
				totalSupply: ethers.formatUnits(totalSupply, decimals),
				balance: ethers.formatUnits(balance, decimals),
			});
		} catch (err) {
			console.error('获取代币信息失败:', err);
		}
	};

	// 转账
	const transferTokens = async (to: string, amount: string) => {
		if (!readWriteContract.isReady || !readWriteContract.isWriteable) {
			alert('请先连接钱包');
			return;
		}

		try {
			const decimals = await readWriteContract.read<number>('decimals');
			const amountWei = ethers.parseUnits(amount, decimals);

			const result = await readWriteContract.writeAndWait(
				'transfer',
				[to, amountWei],
				{},
				1
			);

			console.log('转账成功:', result);
			await refreshBalance();
			await fetchTokenInfo();
		} catch (err) {
			console.error('转账失败:', err);
		}
	};

	// 监听转账事件
	useEffect(() => {
		if (!readOnlyContract.isReady) return;

		const unsubscribe = readOnlyContract.listenEvent(
			'Transfer',
			(from, to, value, event) => {
				console.log(
					`[事件] 从 ${from} 转账 ${ethers.formatUnits(value, 18)} 给 ${to}`
				);
				setEvents((prev) => [
					...prev,
					{ from, to, value: ethers.formatUnits(value, 18), event },
				]);
				// 刷新余额
				if (address && (from === address || to === address)) {
					refreshBalance();
					fetchTokenInfo();
				}
			}
		);

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [readOnlyContract.isReady, address, refreshBalance]);

	// 查询历史事件
	const queryHistoricalEvents = async () => {
		if (!readOnlyContract.isReady || !provider) return;

		try {
			// const events = await readOnlyContract.queryEvents(
			// 	'Transfer',
			// 	'earliest',
			// 	'latest'
			// );
			const currentBlock = await provider.getBlockNumber();
			const fromBlock = currentBlock - 1000; // 往前 10000 个区块
			const toBlock = 'latest';

			const events = await readOnlyContract.queryEvents(
				'Transfer',
				fromBlock,
				toBlock
			);
			console.log('历史事件:', events);
			setEvents(events);
		} catch (err) {
			console.error('查询历史事件失败:', err);
		}
	};

	return (
		<div className="pt-4 pb-4">
			<h1>Web3 DApp Demo</h1>

			{/* 钱包连接 */}
			<div
				style={{
					border: '1px solid #ccc',
					padding: '20px',
					marginBottom: '20px',
				}}
			>
				<h2>钱包状态</h2>
				{!isConnected ? (
					<Button onClick={connect} disabled={isWalletLoading}>
						{isWalletLoading ? '连接中...' : '连接 MetaMask'}
					</Button>
				) : (
					<>
						<p>地址: {address}</p>
						<p>余额: {balance} ETH</p>
						<Button onClick={refreshBalance}>刷新余额</Button>
						<Button onClick={disconnect}>断开连接</Button>
					</>
				)}
				{walletError && (
					<p style={{ color: 'red' }}>{walletError.message}</p>
				)}
			</div>

			{/* 代币信息 */}
			{isConnected && (
				<div
					style={{
						border: '1px solid #ccc',
						padding: '20px',
						marginBottom: '20px',
					}}
				>
					<h2>代币信息</h2>
					<Button onClick={fetchTokenInfo}>获取代币信息</Button>
					<pre>{JSON.stringify(tokenInfo, null, 2)}</pre>
				</div>
			)}

			{/* 转账操作 */}
			{isConnected && (
				<div
					style={{
						border: '1px solid #ccc',
						padding: '20px',
						marginBottom: '20px',
					}}
				>
					<h2>转账操作</h2>
					<Input
						placeholder="收款地址"
						id="recipient"
						style={{ marginRight: '10px', width: '300px' }}
					/>
					<Input
						placeholder="金额"
						id="amount"
						style={{ marginRight: '10px', width: '100px' }}
					/>
					<Button
						onClick={() => {
							const to = (
								document.getElementById(
									'recipient'
								) as HTMLInputElement
							).value;
							const amount = (
								document.getElementById(
									'amount'
								) as HTMLInputElement
							).value;
							transferTokens(to, amount);
						}}
						disabled={readWriteContract.transaction.isLoading}
					>
						{readWriteContract.transaction.isLoading
							? '转账中...'
							: '转账'}
					</Button>
					{readWriteContract.transaction.hash && (
						<p>交易Hash: {readWriteContract.transaction.hash}</p>
					)}
					{readWriteContract.transaction.error && (
						<p style={{ color: 'red' }}>
							错误: {readWriteContract.transaction.error.message}
						</p>
					)}
				</div>
			)}

			{/* 事件监听 */}
			<div style={{ border: '1px solid #ccc', padding: '20px' }}>
				<h2>事件日志</h2>
				<Button onClick={queryHistoricalEvents}>查询历史事件</Button>
				<div style={{ maxHeight: '300px', overflow: 'auto' }}>
					{events.map((event, index) => (
						<pre key={index}>{JSON.stringify(event, null, 2)}</pre>
					))}
				</div>
			</div>
		</div>
	);
}
