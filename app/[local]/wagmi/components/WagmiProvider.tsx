'use client'
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const config = getDefaultConfig({
	appName: 'my-next-dapp',
	projectId: 'e7ae58a69fba1b98149541f9fb6751b2',
	// chains: [mainnet, polygon, optimism, arbitrum, base],
	chains: [mainnet],
	ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();
export default ({ children }: { children: React.ReactNode }) => {
	return (
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<RainbowKitProvider>{children}</RainbowKitProvider>
			</QueryClientProvider>
		</WagmiProvider>
	);
};
