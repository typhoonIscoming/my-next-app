'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import useIsMounted from '@/hooks/useIsMounted';
import Skeleton from './Skeleton';
import WagmiBaseInfo from './WagmiBaseInfo';
// 自定义链接钱包按钮
import CustomConnectButton from './CustomConnectButton';

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
				{/* <ConnectButton showBalance={false} /> */}
				<CustomConnectButton />
			</div>
			<div className="pl-4 pr-4 min-h-[110vh]">
				<WagmiBaseInfo />
			</div>
		</div>
	);
};
