import useAccount from './useAccount';

export default function WagmiInfo() {
	const { balance, targetAddress } = useAccount();
	return (
		<div className="wagmi-info border rounded-2xl p-4 space-y-3">
			<div>钱包信息</div>
			<div>钱包地址：{targetAddress}</div>
			<div>钱包余额：{balance}</div>
		</div>
	);
}
