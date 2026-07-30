import { getDefaultConfig, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { createConfig, http } from 'wagmi';
import { metaMask, walletConnect, injected, safe } from 'wagmi/connectors';
import { rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';

// const initConfig = getDefaultConfig({
// 	appName: 'my-next-dapp',
// 	projectId: 'e7ae58a69fba1b98149541f9fb6751b2',
// 	chains: [mainnet, polygon, optimism, arbitrum, base],
// 	ssr: true, // If your dApp uses server side rendering (SSR)
// });
// chains 配置的是你的 dApp 支持的区块链网络列表，也就是你的钱包连接后可以切换和交互的区块链
// 钱包连接后的网络列表：当用户连接钱包（如 MetaMask）后，你的 dApp 会告诉钱包："我支持这些网络，你可以让我切换到这里"。
// 如果用户当前网络不在你的 chains 列表中，钱包会提示切换
// 当用户切换网络时，你的 dApp 会自动更新状态和 RPC 请求
// 多链支持：你的 dApp 可以在这些网络之间无缝切换，而无需重新连接钱包
/**
 * [mainnet, polygon, optimism, arbitrum, base]：支持 5 条链

mainnet：以太坊主网（Chain ID: 1）

polygon：Polygon 网络（Chain ID: 137）

optimism：Optimism L2（Chain ID: 10）

arbitrum：Arbitrum L2（Chain ID: 42161）

base：Base 网络（Chain ID: 8453）
*/

/**
 * 可以从'@rainbow-me/rainbowkit/wallets'中导入各个钱包，同时使用connectorsForWallets
 * 函数来构建自己的钱包列表和所需连接器。 这样，您可以自由控制显示哪些钱包以及显示的顺序。
 */
const connectors = connectorsForWallets(
	[
		{
			groupName: 'Recommended',
			wallets: [rainbowWallet, walletConnectWallet],
		},
	],
	{
		appName: 'my-next-dapp',
		projectId: 'e7ae58a69fba1b98149541f9fb6751b2',
	}
);
const initConfig = createConfig({
	chains: [mainnet, sepolia],
	// connectors: [metaMask(), injected(), safe()],
	connectors,
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
	},
});

export const config = initConfig;
