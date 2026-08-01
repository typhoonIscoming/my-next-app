import { useConnect, useConnections } from 'wagmi';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function WagmiConnection() {
	const { connect, connectors } = useConnect();
	const connections = useConnections();
	console.log('connections', connections);
	return (
		<div className="border rounded-2xl p-4 space-y-3">
			<div>初始化配置了哪些connection</div>
			<div className="grid grid-cols-3 gap-2">
				{connectors.map((connector) => {
					// console.log('connection', connection);
					return (
						<Button
							key={connector.uid}
							onClick={() => connect({ connector: connector })}
						>
							{connector.icon && (
								<Image
									src={connector.icon}
									alt={connector.name}
									width={20}
									height={20}
								/>
							)}
							{connector.name} - {connector.type}
						</Button>
					);
				})}
			</div>
		</div>
	);
}
