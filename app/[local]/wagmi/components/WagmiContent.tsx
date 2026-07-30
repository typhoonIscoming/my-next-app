'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import useIsMounted from '@/hooks/useIsMounted';
import Skeleton from './Skeleton';
import WagmiInfo from './WagmiInfo';

export default () => {
	// 🔥 关键：使用 useIsMounted 防止水合错误
	// 服务端渲染时返回加载状态或占位符
	const isMounted = useIsMounted();
	if (!isMounted) {
		return <Skeleton />;
	}
	return (
		<div className="wagmi-content space-y-3">
			<div className="flex justify-end">
				<ConnectButton showBalance={false} />
			</div>
			{isMounted ? <WagmiInfo /> : null}
		</div>
	);
};
