import { formatUnits, parseUnits, formatEther, parseEther } from 'viem';
import { Spinner } from '@/components/ui/spinner';
import { useReadContractLocal } from '../hooks/useReadContract';

function ErrorInfo({ text }: { text?: string }) {
	return (
		<div className="space-y-3">
			<div>获取合约信息错误</div>
			{text && <div>{text}</div>}
		</div>
	);
}

export default function WagmiContractBaseInfo() {
	const { result, balance, name, symbol, decimals } = useReadContractLocal();
	const { failureReason, data, isLoading, isError } = result;
	console.log('WagmiContractBaseInfo', data, balance);
	return (
		<div className="border rounded-2xl p-4 space-y-3">
			<div>使用wagmi获取部署到sepolia的合约信息</div>
			{isLoading ? (
				<div className="flex items-center">
					<Spinner />
					<span className="m-1.25">加载中</span>
				</div>
			) : isError ? (
				<ErrorInfo text={new Error(failureReason?.shortMessage).message} />
			) : (
				<div>
					<div>总供给量：{data ? formatUnits(data as bigint, 18) : '0'} ETH</div>
					<div>余额：{balance ? formatUnits(balance as bigint, 18) : '0'} ETH</div>
					<div>名称：{name}</div>
					<div>代币符号：{symbol}</div>
					<div>代币精度：{decimals}</div>
				</div>
			)}
		</div>
	);
}
