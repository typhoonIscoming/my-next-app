import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { mainnetNetUrl, sepoliaNetUrl } from '@/lib/utils';

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
console.log('sepoliaNetUrl', sepoliaNetUrl);
console.log('mainnetNetUrl', mainnetNetUrl);
export const stakeWagmiConfig = createConfig({
	chains: [mainnet, sepolia],
	// connectors: [metaMask(), injected(), safe()],
	connectors,
	transports: {
		// [mainnet.id]: http(mainnetNetUrl),
		[sepolia.id]: http(sepoliaNetUrl),
		[mainnet.id]: http(),
		// [sepolia.id]: http(),
	},
});
