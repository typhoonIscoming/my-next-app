// hooks/useEthereum.ts
import {
	useAccount,
	useBalance,
	useSendTransaction,
	useReadContract,
	useWatchContractEvent,
} from 'wagmi';
import { parseEther, erc20Abi, type Address } from 'viem';
import { mainnet } from 'viem/chains';
import { useState } from 'react';

// Hook 1: 查询 ETH 余额
export function useEthBalance(address?: Address) {
	const { address: connectedAddress } = useAccount();
	const targetAddress = address || connectedAddress;

	const { data, isLoading, error, refetch } = useBalance({
		address: targetAddress,
		chainId: mainnet.id,
	});

	return {
		balance: data?.formatted ?? '0',
		symbol: data?.symbol ?? 'ETH',
		decimals: data?.decimals ?? 18,
		rawBalance: data?.value,
		isLoading,
		error,
		refetch,
	};
}

// Hook 2: 发送 ETH
export function useSendEth() {
	const { sendTransaction, data: hash, error } = useSendTransaction();
	const [isLoading, setLoading] = useState(false);
	const sendEth = async (to: Address, amount: string) => {
		setLoading(true);
		try {
			await sendTransaction({
				to,
				value: parseEther(amount),
			});
		} catch (err) {
			console.error('发送 ETH 失败:', err);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	return {
		sendEth,
		hash,
		isLoading,
		error,
		isSuccess: !!hash,
	};
}

// Hook 3: 查询 ERC-20 余额
export function useTokenBalance({
	tokenAddress,
	userAddress,
}: {
	tokenAddress: Address;
	userAddress?: Address;
}) {
	const { address: connectedAddress } = useAccount();
	const targetAddress = userAddress || connectedAddress;

	const { data, isLoading, error, refetch } = useReadContract({
		address: tokenAddress,
		abi: erc20Abi,
		functionName: 'balanceOf',
		args: targetAddress ? [targetAddress] : undefined,
		query: {
			enabled: !!targetAddress,
		},
	});

	return {
		balance: data as bigint | undefined,
		formattedBalance: data ? (Number(data) / 1e18).toString() : '0', // 假设 18 位小数，可根据实际情况调整
		isLoading,
		error,
		refetch,
	};
}

// Hook 4: 监听 Transfer 事件
export function useTokenTransferEvents({
	tokenAddress,
	onTransfer,
}: {
	tokenAddress: Address;
	onTransfer?: (from: Address, to: Address, value: bigint) => void;
}) {
	useWatchContractEvent({
		address: tokenAddress,
		abi: erc20Abi,
		eventName: 'Transfer',
		onLogs: (logs) => {
			console.log('logs', logs);
			logs.forEach((log) => {
				if (log.args.from && log.args.to && log.args.value) {
					onTransfer?.(log.args.from, log.args.to, log.args.value);
				}
			});
		},
	});
}
