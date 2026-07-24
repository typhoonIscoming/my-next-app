'use client';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask } from 'wagmi/connectors';

// 创建 wagmi 配置
const config = createConfig({
	chains: [mainnet, sepolia],
	connectors: [metaMask()],
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
	},
});

const queryClient = new QueryClient();

// { children }: { children: React.ReactNode }
export default function Provider({ children }: { children: React.ReactNode }) {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<div className="p-4 rounded-2xl border shadow shadow-blue-300">
					<div>这里展示view的使用</div>
					{children}
				</div>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
