'use client';
import { useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { cn, formatNumber, toChainTokenAddress } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { ArrowUpDown, Settings, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAccount, useBalance } from 'wagmi';
import { parseUnits } from 'viem';
import { formatAddress, tokens } from '@/lib/utils';
import type { Token } from '../liquidity/types';
import TokenSelector from '../liquidity/tokenSelector';
import useGetTokenOptions from './hooks/useGetTokenOptions';
import useSwap from './hooks/useSwap';
import usePools from './hooks/usePools';

const ETH_TOKEN: Token = {
	address: tokens.ETH.address,
	symbol: tokens.ETH.symbol,
	name: tokens.ETH.name,
	decimals: tokens.ETH.decimals,
	supportsPermit: false,
};
const EMPTY_INDEX_PATH: number[] = [];
const ETH_ADDRESS_LOWER = tokens.ETH.address.toLowerCase();
const WETH_ADDRESS_LOWER = (tokens.ETH.wrappedAddress as string).toLowerCase();
const LEGACY_WETH_ADDRESS_LOWER = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14';
const WRAPPED_ETH_ALIASES = new Set<string>([WETH_ADDRESS_LOWER, LEGACY_WETH_ADDRESS_LOWER]);
const FALLBACK_TOKEN_LIST: Token[] = [
	ETH_TOKEN,
	...Object.values(tokens)
		.filter((token) => !('isNative' in token && token.isNative))
		.map((token) => ({
			address: token.address,
			symbol: token.symbol,
			name: token.name,
			decimals: token.decimals,
			supportsPermit: false,
		})),
];

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
	const [fromToken, setFromToken] = useState<Token>(FALLBACK_TOKEN_LIST[0]);
	const [fromAmount, setFromAmount] = useState('');
	const [toToken, setToToken] = useState<Token>(FALLBACK_TOKEN_LIST[1] ?? FALLBACK_TOKEN_LIST[0]);
	const [toAmount, setToAmount] = useState('');
	const [slippage, setSlippage] = useState(0.5);
	const [quoteError, setQuoteError] = useState<string | null>(null);
	const [isQuoting, setIsQuoting] = useState(false);
	const [isSimulated, setIsSimulated] = useState(false);

	const { fromTokenOptions, toTokenOptions } = useGetTokenOptions({ toToken, fromToken });
	const {
		executeSwap,
		approveToken,
		getQuote,
		useTokenAllowance,
		isPending,
		isConfirming,
		isConfirmed,
		hash,
	} = useSwap();
	const { pools, loading: poolsLoading, error: poolsError } = usePools();

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
	const { data: toTokenBalance } = useBalance({
		address: address,
		token: isEthLikeAddress(toToken.address)
			? undefined
			: (toChainTokenAddress(toToken.address) as `0x${string}`),
		query: {
			enabled: Boolean(address && isConnected && !isEthLikeAddress(toToken.address)),
		},
	});
	/** 有有效卖出数量时才拉报价/展示误差与「到」侧数字；避免空输入时 effect 随池子 index 等依赖反复 setState。 */
	const shouldShowQuote = useMemo(() => {
		if (!fromAmount) return false;
		const n = parseFloat(fromAmount);
		return Number.isFinite(n) && n > 0;
	}, [fromAmount]);
	const displayToAmount = shouldShowQuote ? toAmount : '';
	const displayQuoteError = shouldShowQuote ? quoteError : null;

	const displayedFromBalance =
		!fromToken || isEthLikeAddress(fromToken.address) ? nativeBalance : fromTokenBalance;
	const displayedToBalance = isEthLikeAddress(toToken.address) ? nativeBalance : toTokenBalance;

	// 检查授权（原生 ETH 不需要 allowance）
	const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(
		isEthLikeAddress(fromToken.address) ? '' : fromToken.address
	);
	// 派生状态：避免 useEffect + setState；allowance 等依赖在 wagmi 下可能每帧变引用，会触发「Maximum update depth」。
	const needsApproval = useMemo(() => {
		if (isEthLikeAddress(fromToken.address)) return false;
		if (fromToken.supportsPermit) return false;
		if (!fromAmount || parseFloat(fromAmount) <= 0) return false;
		if (allowance == null) return true;
		try {
			const amountWei = parseUnits(fromAmount, fromToken.decimals);
			return allowance < amountWei;
		} catch {
			return true;
		}
	}, [
		allowance,
		fromAmount,
		fromToken.address,
		fromToken.decimals,
		fromToken.supportsPermit,
		isEthLikeAddress,
	]);
	const toComparableAddress = useCallback((tokenAddress: string) => {
		const normalized = tokenAddress.toLowerCase();
		if (normalized === ETH_ADDRESS_LOWER || WRAPPED_ETH_ALIASES.has(normalized)) {
			return WETH_ADDRESS_LOWER;
		}
		return toChainTokenAddress(tokenAddress).toLowerCase();
	}, []);
	const activePairPools = useMemo(() => {
		const from = toComparableAddress(fromToken.address);
		const to = toComparableAddress(toToken.address);
		return pools.filter((pool) => {
			const p0 = toComparableAddress(pool.token0);
			const p1 = toComparableAddress(pool.token1);
			return (p0 === from && p1 === to) || (p0 === to && p1 === from);
		});
	}, [pools, fromToken.address, toToken.address, toComparableAddress]);

	// 流动性最高的池 index；先收敛为标量再生成 path，避免 activePairPools 仅引用变化时 new [] 触发下游无限更新。
	const primaryPoolIndex = useMemo(() => {
		if (activePairPools.length === 0) return -1;
		const sorted = [...activePairPools].sort((a, b) => {
			const liqA = Number(a.liquidity || '0');
			const liqB = Number(b.liquidity || '0');
			return liqB - liqA;
		});
		return Number(sorted[0].index);
	}, [activePairPools]);
	const selectedIndexPath = useMemo<number[]>(() => {
		if (primaryPoolIndex < 0) return EMPTY_INDEX_PATH;
		return [primaryPoolIndex];
	}, [primaryPoolIndex]);

	const handleFromAmountChange = useCallback((value: string) => {
		setFromAmount(value);
	}, []);

	const handleSwapTokens = () => {
		setFromToken(toToken);
		setToToken(fromToken);
		setFromAmount(toAmount);
		setToAmount(fromAmount);
		setQuoteError(null); // 交换代币时清除错误
	};
	const handleApprove = async () => {
		if (!fromAmount) return;

		try {
			await approveToken(fromToken.address, fromAmount, fromToken.decimals);
		} catch (error) {
			console.error('Approval failed:', error);
		}
	};

	const handleSwap = async () => {
		if (!fromAmount || !toAmount || !isConnected) return;
		if (needsApproval) {
			setQuoteError('授权不足，请先点击 Approve');
			return;
		}
		if (selectedIndexPath.length === 0) {
			setQuoteError('未找到可用池子');
			return;
		}

		try {
			await executeSwap({
				tokenIn: fromToken.address,
				tokenOut: toToken.address,
				amountIn: fromAmount,
				slippage,
				indexPath: selectedIndexPath,
				tokenInDecimals: fromToken.decimals,
				tokenOutDecimals: toToken.decimals,
				tokenInName: fromToken.name,
				tokenInSupportsPermit: fromToken.supportsPermit,
			});
		} catch (error) {
			console.error('Swap failed:', error);
		}
	};
	// 自动获取价格预估
	const updateQuote = useCallback(async () => {
		if (!fromAmount || parseFloat(fromAmount) === 0) {
			setToAmount('');
			setQuoteError(null);
			return;
		}

		setIsQuoting(true);
		setQuoteError(null);
		try {
			const quote = await getQuote({
				tokenIn: fromToken.address,
				tokenOut: toToken.address,
				amountIn: fromAmount,
				slippage,
				indexPath: selectedIndexPath,
				tokenInDecimals: fromToken.decimals,
				tokenOutDecimals: toToken.decimals,
			});

			if (quote) {
				setToAmount(quote.amountOut);
				setIsSimulated(quote.simulated || false);
				setQuoteError(null);
			} else {
				setToAmount('');
				setQuoteError(null);
			}
		} catch (error) {
			console.error('Quote failed:', error);
			setToAmount('');
			// 提取错误消息
			const errorMessage = error instanceof Error ? error.message : '获取报价失败';
			setQuoteError(errorMessage);
		} finally {
			setIsQuoting(false);
		}
	}, [
		fromAmount,
		fromToken.address,
		toToken.address,
		fromToken.decimals,
		toToken.decimals,
		getQuote,
		slippage,
		selectedIndexPath,
	]);

	const updateQuoteRef = useRef(updateQuote);
	updateQuoteRef.current = updateQuote;
	// 防抖拉报价：空输入分支不要 setState（否则依赖变动仍会无限更新）；清空时在 handleFromAmountChange 里同步即可。
	useEffect(() => {
		if (!shouldShowQuote) return;

		const timer = setTimeout(() => {
			void updateQuoteRef.current();
		}, 500);
		return () => clearTimeout(timer);
	}, [
		shouldShowQuote,
		fromToken.address,
		toToken.address,
		fromToken.decimals,
		toToken.decimals,
		slippage,
		primaryPoolIndex,
	]);
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
					<div className="flex items-center justify-between p-4 bg-muted rounded-lg">
						<input
							type="text"
							value={fromAmount}
							onChange={(e) => handleFromAmountChange(e.target.value)}
							placeholder="0"
							className="text-2xl font-medium bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
						/>
						<TokenSelector
							selectedToken={fromToken}
							onSelect={setFromToken}
							label="选择代币"
							tokenList={fromTokenOptions}
							otherToken={null}
						/>
					</div>
				</div>
				{/* Swap Arrow */}
				<div className="flex justify-center mb-4">
					<button
						onClick={handleSwapTokens}
						className="p-2 bg-muted hover:bg-accent border border-border rounded-lg transition-colors"
					>
						<ArrowUpDown className="w-5 h-5 text-muted-foreground" />
					</button>
				</div>

				{/* To Token */}
				<div className="mb-6">
					<div className="flex items-center justify-between mb-2">
						<span className="text-sm text-muted-foreground">到</span>
						<span className="text-sm text-muted-foreground">
							余额:{' '}
							{displayedToBalance
								? formatNumber(Number(displayedToBalance.formatted))
								: '0'}
						</span>
					</div>
					<div className="flex items-center justify-between p-4 bg-muted rounded-lg">
						<div className="text-2xl font-medium text-foreground flex-1">
							{shouldShowQuote && isQuoting ? (
								<div className="flex items-center">
									<Clock className="w-4 h-4 animate-spin mr-2 text-muted-foreground" />
									<span className="text-muted-foreground">获取报价中...</span>
								</div>
							) : displayQuoteError ? (
								<div className="text-sm text-red-600 dark:text-red-400">
									{displayQuoteError}
								</div>
							) : (
								displayToAmount || '0'
							)}
						</div>
						<TokenSelector
							selectedToken={toToken}
							onSelect={setToToken}
							label="选择代币"
							tokenList={toTokenOptions}
							otherToken={null}
						/>
					</div>
					{displayQuoteError && (
						<div className="mt-2 text-xs text-red-600 dark:text-red-400">
							⚠️ {displayQuoteError}
						</div>
					)}
					{isSimulated && (
						<div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
							⚠️ 模拟报价，实际价格可能有差异
						</div>
					)}
				</div>

				{/* Action Button */}
				<div className="space-y-3">
					{!isConnected ? (
						<div className="text-center p-4 bg-muted rounded-lg">
							<p className="text-muted-foreground">请先连接钱包</p>
						</div>
					) : needsApproval ? (
						<button
							onClick={handleApprove}
							disabled={isPending || isConfirming || !fromAmount}
							className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
						>
							{isPending || isConfirming ? '处理中...' : `授权 ${fromToken.symbol}`}
						</button>
					) : (
						<button
							onClick={handleSwap}
							disabled={
								isPending ||
								isConfirming ||
								!fromAmount ||
								!toAmount ||
								parseFloat(fromAmount) === 0 ||
								selectedIndexPath.length === 0
							}
							className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
						>
							{isPending || isConfirming ? '交换中...' : '交换'}
						</button>
					)}

					{/* Price Info */}
					{shouldShowQuote && displayToAmount && parseFloat(displayToAmount) > 0 && (
						<div className="text-xs text-muted-foreground text-center">
							1 {fromToken.symbol} ≈{' '}
							{(parseFloat(displayToAmount) / parseFloat(fromAmount)).toFixed(6)}{' '}
							{toToken.symbol}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
