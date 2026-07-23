import LinkEthers from './components/linkEthers'

export default function EthersPage() {
	return (
		<div className="p-4">
			<div className="p-4 border shadow rounded-2xl">
				本页展示ether.js用法
			</div>
			<LinkEthers />
		</div>
	)
}
