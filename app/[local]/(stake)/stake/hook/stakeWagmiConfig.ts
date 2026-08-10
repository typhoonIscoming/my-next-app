import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask, safe } from 'wagmi/connectors';

export const stakeWagmiConfig = createConfig({
	chains: [mainnet, sepolia],
	connectors: [metaMask(), injected(), safe()],
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
	},
});
