import Providers from './providers';
// import EthereumExample from './EthereumExample';
import WagmiProvider from './components/WagmiProvider';
import WagmiContent from './components/WagmiContent';

export default function ViewPage() {
	return (
		<div className="p-4">
			<WagmiProvider>
				<WagmiContent />
			</WagmiProvider>
		</div>
	);
}
