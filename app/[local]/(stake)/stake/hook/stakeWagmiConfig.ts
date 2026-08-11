import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask, safe } from 'wagmi/connectors';
import { rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { getDefaultConfig, connectorsForWallets } from '@rainbow-me/rainbowkit';

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
export const stakeWagmiConfig = createConfig({
	chains: [mainnet, sepolia],
	// connectors: [metaMask(), injected(), safe()],
	connectors,
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
	},
});
