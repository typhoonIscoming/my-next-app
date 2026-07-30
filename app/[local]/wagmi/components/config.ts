import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';

export const config = getDefaultConfig({
	appName: 'my-next-dapp',
	projectId: 'e7ae58a69fba1b98149541f9fb6751b2',
	// chains: [mainnet, polygon, optimism, arbitrum, base],
	chains: [mainnet],
	ssr: true, // If your dApp uses server side rendering (SSR)
});
