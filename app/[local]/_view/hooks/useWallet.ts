import { useEffect, useState, useCallback } from 'react';
import { createWalletClient, custom, type Address } from 'viem';
import { sepolia } from 'viem/chains';
import { useClients } from './useClients';

interface WalletState {
	address: Address | null;
	isConnected: boolean;
	isConnecting: boolean;
	chainId: number | null;
	error: Error | null;
}

export const useWallet = () => {
	const { publicClient, walletClient } = useClients();
	const [state, setState] = useState<WalletState>({
		address: null,
		isConnected: false,
		isConnecting: false,
		chainId: null,
		error: null,
	});

	// 连接钱包
	const connect = useCallback(async () => {
		if (!window.ethereum) {
			setState((prev) => ({
				...prev,
				error: new Error('请安装MetaMask钱包'),
			}));
			return;
		}

		setState((prev) => ({ ...prev, isConnecting: true, error: null }));

		try {
			// 请求账户连接
			const accounts = (await window.ethereum.request({
				method: 'eth_requestAccounts',
			})) as Address[];

			const chainId = (await window.ethereum.request({
				method: 'eth_chainId',
			})) as string;

			setState({
				address: accounts[0],
				isConnected: true,
				isConnecting: false,
				chainId: parseInt(chainId, 16),
				error: null,
			});

			// 切换到Sepolia测试网（如需要）
			if (parseInt(chainId, 16) !== sepolia.id) {
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: `0x${sepolia.id.toString(16)}` }],
				});
			}
		} catch (error) {
			setState((prev) => ({
				...prev,
				isConnecting: false,
				error: error as Error,
			}));
		}
	}, []);

	// 断开连接
	const disconnect = useCallback(() => {
		setState({
			address: null,
			isConnected: false,
			isConnecting: false,
			chainId: null,
			error: null,
		});
	}, []);

	// 监听账户变化
	useEffect(() => {
		if (!window.ethereum) return;

		const handleAccountsChanged = (accounts: Address[]) => {
			if (accounts.length === 0) {
				disconnect();
			} else {
				setState((prev) => ({
					...prev,
					address: accounts[0],
					isConnected: true,
				}));
			}
		};

		const handleChainChanged = (chainId: string) => {
			setState((prev) => ({
				...prev,
				chainId: parseInt(chainId, 16),
			}));
		};

		window.ethereum.on('accountsChanged', handleAccountsChanged);
		window.ethereum.on('chainChanged', handleChainChanged);

		return () => {
			window.ethereum.removeListener(
				'accountsChanged',
				handleAccountsChanged
			);
			window.ethereum.removeListener('chainChanged', handleChainChanged);
		};
	}, [disconnect]);

	return {
		...state,
		connect,
		disconnect,
		// 获取钱包客户端
		getWalletClient: () => walletClient,
	};
};
