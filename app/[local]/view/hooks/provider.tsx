'use client';
import { sepolia } from 'viem/chains';
import {
	createPublicClient,
	createWalletClient,
	http,
	custom,
	type PublicClient,
	type WalletClient,
} from 'viem';
import {
	createContext,
	useContext,
	ReactNode,
	useMemo,
	useEffect,
	useState,
} from 'react';

// 创建 Context
const ClientsContext = createContext<{
	publicClient: PublicClient | null;
	walletClient: WalletClient | null;
}>({
	publicClient: null,
	walletClient: null,
});

export const ClientsProvider = ({ children }: { children: ReactNode }) => {
	const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

	// Public Client - 立即创建（不依赖浏览器）
	const publicClient = useMemo(() => {
		return createPublicClient({
			chain: sepolia,
			transport: http(
				process.env.NEXT_PUBLIC_RPC_URL ||
					'https://eth-sepolia.g.alchemy.com/v2/demo'
			),
			batch: { multicall: true },
		});
	}, []);

	// Wallet Client - 仅在客户端创建
	useEffect(() => {
		const initWalletClient = () => {
			// 检查是否在浏览器环境且有 ethereum
			if (typeof window !== 'undefined' && window.ethereum) {
				try {
					const client = createWalletClient({
						chain: sepolia,
						transport: custom(window.ethereum),
					});
					setWalletClient(client);
				} catch (error) {
					console.error('Failed to create wallet client:', error);
					setWalletClient(null);
				}
			} else {
				// 没有 MetaMask
				console.warn('MetaMask not detected');
				setWalletClient(null);
			}
		};

		initWalletClient();
	}, []);

	return (
		<ClientsContext.Provider value={{ publicClient, walletClient }}>
			{children}
		</ClientsContext.Provider>
	);
};
