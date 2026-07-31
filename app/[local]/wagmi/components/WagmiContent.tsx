'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import useIsMounted from '@/hooks/useIsMounted';
import Skeleton from './Skeleton';
import WagmiBaseInfo from './WagmiBaseInfo';
// 自定义链接钱包按钮
import CustomConnectButton from './CustomConnectButton';
import WagmiContractBaseInfo from './WagmiContractBaseInfo';
import WagmiTransfer from './WagmiTransfer';
import WagmiListenContract from './WagmiListenContract';

export default () => {
	// 🔥 关键：使用 useIsMounted 防止水合错误
	// 服务端渲染时返回加载状态或占位符
	const isMounted = useIsMounted();
	if (!isMounted) {
		return <Skeleton />;
	}
	return (
		<div className="wagmi-content">
			<div className="p-4 flex justify-end sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				{/* <ConnectButton showBalance={true} /> */}
				<CustomConnectButton />
			</div>
			<div className="pl-4 pr-4 space-y-3 min-h-[110vh]">
				<WagmiBaseInfo />
				<WagmiContractBaseInfo />
				<WagmiTransfer />
				<WagmiListenContract />
			</div>
		</div>
	);
};
