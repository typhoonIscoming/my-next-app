'use client';
import { useCallback, useState } from 'react';
import { cn, formatNumber, toChainTokenAddress } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { ChevronDown, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAccount, useBalance } from 'wagmi';
import { formatAddress, tokens } from '@/lib/utils';
import type { Token } from '../liquidity/types';

const ETH_ADDRESS_LOWER = tokens.ETH.address.toLowerCase();
const WETH_ADDRESS_LOWER = (tokens.ETH.wrappedAddress as string).toLowerCase();
const LEGACY_WETH_ADDRESS_LOWER = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14';
const WRAPPED_ETH_ALIASES = new Set<string>([WETH_ADDRESS_LOWER, LEGACY_WETH_ADDRESS_LOWER]);

export default function MetaSwapPage() {
	const { address, isConnected } = useAccount();
	const { data: nativeBalance } = useBalance({
		address,
		query: {
			enabled: Boolean(address && isConnected),
		},
	});

	const [open, setIsOpen] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [slippage, setSlippage] = useState(0.5);
	const [fromToken, setFromToken] = useState<Token | null>(null);

	const isEthLikeAddress = useCallback((tokenAddress: string) => {
		const normalized = tokenAddress.toLowerCase();
		return normalized === ETH_ADDRESS_LOWER || WRAPPED_ETH_ALIASES.has(normalized);
	}, []);
	const handleMaxAmount = useCallback(() => {}, []);

	// 获取代币余额
	const { data: fromTokenBalance } = useBalance({
		address: address,
		token:
			!fromToken || isEthLikeAddress(fromToken.address)
				? undefined
				: (toChainTokenAddress(fromToken.address) as `0x${string}`),
		query: {
			enabled: Boolean(
				address && isConnected && fromToken && !isEthLikeAddress(fromToken.address)
			),
		},
	});

	const displayedFromBalance =
		!fromToken || isEthLikeAddress(fromToken.address) ? nativeBalance : fromTokenBalance;

	return (
		<div className="min-h-[150vh]">
			<div className="bg-white m-auto max-w-150 rounded-2xl shadow-lg p-4">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold text-gray-600">交换</h2>
					<button
						onClick={() => setShowSettings(!showSettings)}
						className="p-2 cursor-pointer hover:bg-accent rounded-lg transition-colors"
					>
						<Settings className="w-5 h-5 text-muted-foreground" />
					</button>
				</div>
				{isConnected && address && (
					<div className="mb-4 p-3 bg-primary/10 rounded-lg">
						<div className="text-sm text-primary">已连接: {formatAddress(address)}</div>
					</div>
				)}

				{/*滑点设置*/}
				{showSettings && (
					<div className="mb-6 p-4 bg-muted rounded-lg">
						<div className="text-sm font-medium mb-2 text-muted-foreground">
							滑点容忍度
						</div>
						<div className="flex space-x-2">
							{[0.1, 0.5, 1.0].map((value) => (
								<button
									key={value}
									onClick={() => setSlippage(value)}
									className={cn(
										'px-3 py-1 cursor-pointer rounded text-sm transition-colors',
										slippage === value
											? 'bg-primary text-primary-foreground'
											: 'bg-background border border-border hover:bg-accent'
									)}
								>
									{value}%
								</button>
							))}
						</div>
					</div>
				)}
				<div className="mb-4">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm text-muted-foreground">从</span>
						<div className="flex items-center space-x-2">
							<span className="text-sm text-muted-foreground">
								余额:{' '}
								{displayedFromBalance && displayedFromBalance.formatted
									? formatNumber(Number(displayedFromBalance.formatted))
									: '0'}
							</span>
							{displayedFromBalance &&
								parseFloat(displayedFromBalance.formatted) > 0 && (
									<button
										onClick={handleMaxAmount}
										className="text-xs text-primary hover:text-primary/80 font-medium"
									>
										最大
									</button>
								)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
