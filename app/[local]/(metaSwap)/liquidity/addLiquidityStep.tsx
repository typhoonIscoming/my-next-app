'use client';
import { cn } from '@/lib/utils';
import { useContext, useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { parseUnits } from 'viem';
import { useBalance, useAccount } from 'wagmi';
import LiquidityContext from './context';
import { formatAddress, feeTiers, isNativeTokenAddress, parseInputAmount } from '@/lib/utils';
import { toChainTokenAddress, formatNumber } from '@/lib/utils';
import { Info, AlertCircle } from 'lucide-react';
import type { Token } from './types';

export default function AddLiquidityStep() {
	const { address, isConnected } = useAccount();
	const t = useTranslations();
	const { poolExists, isCheckingPool, currentPool, fee, token0, token1 } =
		useContext(LiquidityContext);
	const [initialPrice, setInitialPrice] = useState('');
	const [priceError, setPriceError] = useState<any>(null);
	const [transactionError, setTransactionError] = useState<string | null>(null);
	const [amount0, setAmount0] = useState('');
	const [amount1, setAmount1] = useState('');
	const [isCalculating, setIsCalculating] = useState(false);

	// 查询钱包中token0的余额
	const { data: token0Balance, refetch: refetchToken0Balance } = useBalance({
		address: address,
		token: token0 ? (toChainTokenAddress(token0.address) as `0x${string}`) : undefined,
		query: {
			enabled: Boolean(address && isConnected && token0),
		},
	});
	// 查询钱包中token1的余额
	const { data: token1Balance, refetch: refetchToken1Balance } = useBalance({
		address: address,
		token: token1 ? (toChainTokenAddress(token1.address) as `0x${string}`) : undefined,
		query: {
			enabled: Boolean(address && isConnected && token1),
		},
	});
	// 查询钱包中原生代币的余额
	const { data: nativeBalance, refetch: refetchNativeBalance } = useBalance({
		address: address,
		query: {
			enabled: Boolean(address && isConnected),
		},
	});

	const hasInsufficientBalance0 = useMemo(() => {
		const availableBalance =
			token0 && isNativeTokenAddress(token0.address) ? nativeBalance : token0Balance;
		if (!token0 || !availableBalance || !amount0) return false;
		try {
			return parseUnits(amount0, token0.decimals) > availableBalance.value;
		} catch {
			return false;
		}
	}, [token0, token0Balance, nativeBalance, amount0]);

	const hasInsufficientBalance1 = useMemo(() => {
		const availableBalance =
			token1 && isNativeTokenAddress(token1.address) ? nativeBalance : token1Balance;
		if (!token1 || !availableBalance || !amount1) return false;
		try {
			return parseUnits(amount1, token1.decimals) > availableBalance.value;
		} catch {
			return false;
		}
	}, [token1, token1Balance, nativeBalance, amount1]);

	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInputAmount(e.target.value);
		setInitialPrice(value);
		if (isNaN(Number(value)) || Number(value) <= 0) {
			setPriceError(t('swap.invalidPrice'));
		} else {
			setPriceError('');
		}
	};
	const getRequiredBalanceLabel = useCallback((token: Token | null) => {
		if (!token) return '代币';
		if (isNativeTokenAddress(token.address)) {
			return 'WETH';
		}
		return token.symbol;
	}, []);

	// 计算对应数量
	const calculateAmount = useCallback(
		async (inputToken: 'token0' | 'token1', amount: string) => {
			if (!amount || parseFloat(amount) === 0) {
				if (inputToken === 'token0') {
					setAmount1('');
				} else {
					setAmount0('');
				}
				setPriceError(null);
				return;
			}

			setIsCalculating(true);
			setPriceError(null);

			try {
				if (poolExists && currentPool && token0 && token1) {
					// 如果池子存在，使用池子价格计算
					const response = await fetch('/api/pools/price', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							poolAddress: currentPool,
							inputToken: inputToken === 'token0' ? token0.address : token1.address,
							inputAmount: amount,
						}),
					});

					const data = await response.json();

					if (!response.ok || !data.success) {
						const errorMsg = data.msg || data.error || '计算价格失败';
						setPriceError(errorMsg);
						// 如果计算失败，清空对应的输出金额
						if (inputToken === 'token0') {
							setAmount1('');
						} else {
							setAmount0('');
						}
						return;
					}

					// 成功计算
					if (inputToken === 'token0') {
						setAmount1(data.outputAmount);
					} else {
						setAmount0(data.outputAmount);
					}
					setPriceError(null);
				} else {
					// 如果池子不存在，使用初始价格比率计算
					const priceRatio = parseFloat(initialPrice);
					if (priceRatio > 0 && isFinite(priceRatio)) {
						try {
							if (inputToken === 'token0') {
								const calculated = parseFloat(amount) * priceRatio;
								setAmount1(isNaN(calculated) ? '' : calculated.toString());
							} else {
								const calculated = parseFloat(amount) / priceRatio;
								setAmount0(isNaN(calculated) ? '' : calculated.toString());
							}
							setPriceError(null);
						} catch (calcError) {
							console.error('价格计算错误:', calcError);
							setPriceError('价格计算失败，请检查输入');
							if (inputToken === 'token0') {
								setAmount1('');
							} else {
								setAmount0('');
							}
						}
					} else {
						// 默认 1:1
						if (inputToken === 'token0') {
							setAmount1(amount);
						} else {
							setAmount0(amount);
						}
						setPriceError(null);
					}
				}
			} catch (error) {
				console.error('计算数量失败:', error);
				const errorMsg = error instanceof Error ? error.message : '计算价格失败';
				setPriceError(errorMsg);
				// 清空对应的输出金额
				if (inputToken === 'token0') {
					setAmount1('');
				} else {
					setAmount0('');
				}
			} finally {
				setIsCalculating(false);
			}
		},
		[poolExists, currentPool, token0, token1, initialPrice]
	);

	const handleAmount0Change = (value: string) => {
		const parsed = parseInputAmount(value);
		setAmount0(parsed);
		calculateAmount('token0', parsed);
	};

	const handleMaxAmount0 = () => {
		const maxBalance =
			token0 && isNativeTokenAddress(token0.address) ? nativeBalance : token0Balance;
		if (maxBalance) {
			setAmount0(maxBalance.formatted);
			calculateAmount('token0', maxBalance.formatted);
		}
	};
	return (
		<div>
			<div className="mt-4 p-3 bg-(--muted-primary) rounded-lg">
				<div className="flex justify-between items-center">
					<span className="text-sm text-gray-600">{t('swap.poolStatus')}</span>
					<span
						className={cn(
							'text-sm font-medium',
							isCheckingPool
								? 'text-primary'
								: poolExists
									? 'text-green-600 dark:text-green-400'
									: 'text-orange-600 dark:text-orange-400'
						)}
					>
						{isCheckingPool
							? t('swap.checking')
							: poolExists
								? t('swap.poolExists')
								: t('swap.poolNotExists')}
					</span>
				</div>
				{currentPool && (
					<div className="mt-1 text-xs text-muted-foreground">
						{t('swap.poolAddress')}: {formatAddress(currentPool)}
					</div>
				)}
			</div>
			<div className="mb-4 mt-4">
				<div className="flex items-center justify-between mb-2">
					<span className="text-sm text-muted-foreground">费率</span>
				</div>
				<div className="flex space-x-2 text-muted-foreground">
					{feeTiers.map((feeValue) => (
						<button
							key={feeValue}
							disabled
							className={cn(
								'px-3 py-2 bg-emerald-300 rounded text-sm transition-colors flex-1',
								fee === feeValue
									? 'bg-primary text-primary-foreground'
									: 'bg-(--muted-primary)'
							)}
						>
							{feeValue / 10000}%
						</button>
					))}
				</div>
			</div>
			{!poolExists && token0 && token1 && (
				<div className="mb-4 p-4 bg-(--muted-primary) rounded-lg">
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center space-x-2">
							<span className="text-sm font-medium text-gray-600">初始价格</span>
							<Info className="w-4 h-4 text-muted-foreground" />
						</div>
					</div>
					<div className="text-xs text-muted-foreground mb-2">
						设置 {token0.symbol} 与 {token1.symbol} 的初始价格比率
					</div>
					<div className="flex items-center space-x-2">
						<span className="text-sm text-muted-foreground">1 {token0.symbol} =</span>
						<input
							type="text"
							value={initialPrice}
							onChange={handlePriceChange}
							placeholder="1"
							className="flex-1 px-3 py-2 bg-white border border-border rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
						/>
						<span className="text-sm text-muted-foreground">{token1.symbol}</span>
					</div>
					{priceError && (
						<div className="mt-2 text-xs text-red-600 dark:text-red-400">
							{priceError}
						</div>
					)}
				</div>
			)}
			{(token0 && isNativeTokenAddress(token0.address)) ||
			(token1 && isNativeTokenAddress(token1.address)) ? (
				<div className="mb-4 p-3 selection:text-black bg-amber-50 border rounded-lg text-sm text-amber-700">
					{t('swap.originalTokenDesc')}
				</div>
			) : null}

			{transactionError && (
				<div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
					<div className="flex items-center">
						<AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
						<span className="text-sm text-red-600 dark:text-red-400">
							{transactionError}
						</span>
					</div>
				</div>
			)}

			{(hasInsufficientBalance0 || hasInsufficientBalance1) && (
				<div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
					<div className="flex items-center">
						<AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
						<span className="text-sm text-red-600 dark:text-red-400">
							{hasInsufficientBalance0
								? `${isNativeTokenAddress(token0?.address) ? 'ETH' : getRequiredBalanceLabel(token0)} 余额不足`
								: `${isNativeTokenAddress(token1?.address) ? 'ETH' : getRequiredBalanceLabel(token1)} 余额不足`}
						</span>
					</div>
				</div>
			)}

			{token0 && token1 && (
				<div>
					<div className="mb-4">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-muted-foreground">代币 1</span>
							<div className="flex items-center space-x-2">
								<span className="text-sm text-muted-foreground">
									余额:{' '}
									{token0 && isNativeTokenAddress(token0.address)
										? nativeBalance
											? formatNumber(Number(nativeBalance.formatted))
											: '0'
										: token0Balance
											? formatNumber(Number(token0Balance.formatted))
											: '0'}
								</span>
								{(token0 && isNativeTokenAddress(token0.address)
									? nativeBalance
									: token0Balance) &&
									parseFloat(
										(token0 && isNativeTokenAddress(token0.address)
											? nativeBalance
											: token0Balance)!.formatted
									) > 0 && (
										<button
											onClick={handleMaxAmount0}
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
								value={amount0}
								onChange={(e) => handleAmount0Change(e.target.value)}
								placeholder="0"
								className="text-2xl font-medium bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
							/>
							<div className="px-3 py-2 bg-secondary rounded-lg">
								<span className="font-medium text-secondary-foreground">
									{token0.symbol}
								</span>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
