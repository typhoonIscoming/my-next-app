import Providers from './providers';
import EthereumExample from './EthereumExample';

export default function ViewPage() {
	return (
		<div className="p-4">
			<Providers>
				<EthereumExample />
			</Providers>
		</div>
	);
}
