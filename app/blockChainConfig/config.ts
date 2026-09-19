import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { createConfig, http } from 'wagmi';
import { rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { sepoliaNetUrl, mainnetNetUrl } from '@/lib/utils';

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
const isDev = process.env.NODE_ENV === 'development';
const initConfig = createConfig({
	chains: [mainnet, sepolia],
	connectors,
	transports: {
		[mainnet.id]: isDev ? http(sepoliaNetUrl) : http(),
		[sepolia.id]: isDev ? http(sepoliaNetUrl) : http(),
	},
});
export const config = initConfig;
