'use client';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { metaMask, walletConnect, injected, safe } from 'wagmi/connectors';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';

// injected-通用连接器，用于检测并连接浏览器注入的钱包（如 MetaMask, Brave, Rabby）。
// metaMask-专门为 MetaMask 优化的连接器，体验更佳。可与 injected 共存，让用户有更明确的选择
// walletConnect-支持 WalletConnect 协议，可连接上百种移动端和桌面端钱包。必须在 WalletConnect Cloud 注册一个 projectId
// coinbaseWallet-Coinbase Wallet 专用连接器，支持其浏览器扩展和移动端 App。配置时通常需要提供 appName
// safe-用于连接 Gnosis Safe 等多签钱包。适用于需要多签管理的应用场景
// mock-开发和测试专用。可以模拟钱包账户和功能，无需真实钱包。可配置预置账户和模拟错误，非常适合 CI/CD
// 创建 wagmi 配置
// const config = createConfig({
// 	chains: [mainnet, sepolia],
// 	connectors: [metaMask(), injected(), safe()],
// 	transports: {
// 		[mainnet.id]: http(),
// 		[sepolia.id]: http(),
// 	},
// });
const config = getDefaultConfig({
	appName: 'my-next-dapp',
	projectId: 'e7ae58a69fba1b98149541f9fb6751b2',
	chains: [mainnet, polygon, optimism, arbitrum, base],
	ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider>
					<div className="p-4 rounded-2xl border shadow shadow-blue-300">
						<div>这里展示wagmi的使用</div>
						{children}
					</div>
				</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
}
