import { Spinner } from '@/components/ui/spinner';
import useAccount from '../hooks/useAccount';
import { useBalanceOf } from '../hooks/useBalanceOf';

export default function WagmiInfo() {
	const { balance, targetAddress, isLoading, symbol, decimals, rawBalance } = useAccount();
	const result = useBalanceOf();
	const { isLoading: loading, data, isSuccess } = result;
	return (
		<div className="wagmi-info border rounded-2xl p-4 space-y-3">
			<div>钱包信息</div>
			<div>钱包地址：{targetAddress}</div>
			<div className="flex">钱包余额：{isLoading ? <Spinner /> : `${balance} ${symbol}`}</div>
			<div>decimals: {decimals}</div>
			<div>rawBalance: {rawBalance}</div>
			{isSuccess ? (
				<div>
					<div>使用useBalance获取到钱包的数据</div>
					<div>
						钱包余额：{data.formatted} {data.symbol}
					</div>
					<div>decimals: {data.decimals}</div>
					<div>value: {data.value}</div>
				</div>
			) : null}
		</div>
	);
}
