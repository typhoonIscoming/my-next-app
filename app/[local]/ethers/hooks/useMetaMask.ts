// hooks/useMetaMask.ts
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import type { WalletState } from './type';

declare global {
	interface Window {
		ethereum?: any;
	}
}

export function useMetaMask() {
	const [state, setState] = useState<WalletState>({
		isConnected: false,
		address: undefined,
		chainId: undefined,
		balance: undefined,
		provider: undefined,
		signer: undefined,
	});

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	// 获取余额
	const fetchBalance = useCallback(async (address: string, provider: ethers.BrowserProvider) => {
		try {
			const balance = await provider.getBalance(address);
			return ethers.formatEther(balance);
		} catch (err) {
			console.error('获取余额失败:', err);
			return undefined;
		}
	}, []);

	// 连接钱包
	const connect = useCallback(async () => {
		if (!window || !window?.ethereum) {
			const err = new Error('请安装 MetaMask!');
			setError(err);
			throw err;
		}

		setIsLoading(true);
		setError(null);

		try {
			const provider = new ethers.BrowserProvider(window.ethereum);
			const accounts = await provider.send('eth_requestAccounts', []);
			const signer = await provider.getSigner();
			const network = await provider.getNetwork();

			const address = accounts[0];
			const balance = await fetchBalance(address, provider);
			console.log('refreshBalance', address, balance);
			setState({
				isConnected: true,
				address,
				chainId: Number(network.chainId),
				balance,
				provider,
				signer,
			});

			return { address, signer, provider };
		} catch (err: any) {
			if (err.code === 4001) {
				setError(new Error('用户拒绝了连接请求'));
			} else {
				setError(err);
			}
			throw err;
		} finally {
			setIsLoading(false);
		}
	}, [fetchBalance]);

	// 断开连接
	const disconnect = useCallback(() => {
		// 注意：MetaMask 没有直接的断开 API，我们清除状态
		setState({
			isConnected: false,
			address: undefined,
			chainId: undefined,
			balance: undefined,
			provider: undefined,
			signer: undefined,
		});
		state.provider?.destroy();
		// 移除监听器（防止内存泄漏）
		if (window.ethereum) {
			window.ethereum.removeAllListeners?.('accountsChanged');
			window.ethereum.removeAllListeners?.('chainChanged');
		}
		setError(null);
	}, []);

	// 刷新余额
	const refreshBalance = useCallback(async () => {
		if (!state.isConnected || !state.address || !state.provider) {
			return;
		}

		try {
			const balance = await fetchBalance(state.address, state.provider);
			setState((prev) => ({ ...prev, balance }));
		} catch (err) {
			console.error('刷新余额失败:', err);
		}
	}, [state.isConnected, state.address, state.provider, fetchBalance]);

	// 切换网络
	const switchNetwork = useCallback(async (chainId: number) => {
		if (!window.ethereum) {
			throw new Error('请安装 MetaMask!');
		}

		try {
			await window.ethereum.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: `0x${chainId.toString(16)}` }],
			});
		} catch (err: any) {
			// 如果网络不存在，可以添加网络
			if (err.code === 4902) {
				throw new Error('请先在 MetaMask 中添加此网络');
			}
			throw err;
		}
	}, []);

	// 监听事件
	useEffect(() => {
		if (!window.ethereum) return;

		const handleAccountsChanged = (accounts: string[]) => {
			if (accounts.length === 0) {
				disconnect();
			} else {
				const newAddress = accounts[0];
				setState((prev) => ({
					...prev,
					address: newAddress,
				}));
				if (state.provider) {
					fetchBalance(newAddress, state.provider).then((balance) => {
						setState((prev) => ({ ...prev, balance }));
					});
				}
			}
		};

		const handleChainChanged = () => {
			// 网络变化时刷新页面（最佳实践）
			window.location.reload();
		};

		window.ethereum.on('accountsChanged', handleAccountsChanged);
		window.ethereum.on('chainChanged', handleChainChanged);

		return () => {
			window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
			window.ethereum.removeListener('chainChanged', handleChainChanged);
		};
	}, [disconnect, fetchBalance, state.provider]);

	// 自动连接（可选：检测是否已经连接）
	const checkAutoConnect = useCallback(async () => {
		if (!window.ethereum) return;

		try {
			const provider = new ethers.BrowserProvider(window.ethereum);
			const accounts = await provider.listAccounts();

			if (accounts.length > 0) {
				const signer = await provider.getSigner();
				const network = await provider.getNetwork();
				const address = accounts[0].address;
				const balance = await fetchBalance(address, provider);

				setState({
					isConnected: true,
					address,
					chainId: Number(network.chainId),
					balance,
					provider,
					signer,
				});
			}
		} catch (err) {
			console.error('自动连接失败:', err);
		}
	}, [fetchBalance]);

	// 组件挂载时尝试自动连接
	useEffect(() => {
		checkAutoConnect();
	}, [checkAutoConnect]);

	return {
		...state,
		isLoading,
		error,
		connect,
		disconnect,
		refreshBalance,
		switchNetwork,
		checkAutoConnect,
	};
}
