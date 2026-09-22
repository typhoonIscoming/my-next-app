'use client';
import { cn, tokens } from '@/lib/utils';
import { useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { parseUnits, BaseError } from 'viem';
import { useBalance, useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { useWaitForTransactionReceipt } from 'wagmi';
import LiquidityContext from './context';
import { formatAddress, feeTiers, isNativeTokenAddress, parseInputAmount } from '@/lib/utils';
import { toChainTokenAddress, formatNumber, contracts } from '@/lib/utils';
import { Info, AlertCircle, Clock } from 'lucide-react';
import type { Token, ContractWriteParams, Step, TransactionAction } from './types';
import { Input } from '@/components/ui/input';
import { ERC20_ABI } from '@/lib/metaAbi';

const GAS_LIMIT_CAP = 16_000_000n;
const WETH_ABI = [
	{
		type: 'function',
		name: 'deposit',
		stateMutability: 'payable',
		inputs: [],
		outputs: [],
	},
] as const;
// 稳定性优先：流动性路径固定只走 approve，不走 permit 子调用
const ENABLE_PERMIT_LIQUIDITY = false;

export default function AddLiquidityStep({
	onSetStep,
}: {
	onSetStep: (type: TransactionAction) => void;
}) {
	const { address, isConnected } = useAccount();
	const publicClient = usePublicClient();
	const t = useTranslations();
	const { poolExists, isCheckingPool, currentPool, fee, token0, token1 } =
		useContext(LiquidityContext);
	const [initialPrice, setInitialPrice] = useState('');
	const [priceError, setPriceError] = useState<any>(null);
	const [transactionError, setTransactionError] = useState<string | null>(null);
	const [amount0, setAmount0] = useState('');
	const [amount1, setAmount1] = useState('');
	const [isCalculating, setIsCalculating] = useState(false);
	// token0是否需要授权
	const [needsApproval0, setNeedsApproval0] = useState(false);
	// token1是否需要授权
	const [needsApproval1, setNeedsApproval1] = useState(false);
	// 是否正在授权
	const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
	const [permitSupportMap, setPermitSupportMap] = useState<Record<string, boolean>>({});

	const { writeContract, data: hash, isPending } = useWriteContract();
	const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
		hash,
	});
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

	const token0SupportsPermit = Boolean(
		token0 &&
		!isNativeTokenAddress(token0.address) &&
		permitSupportMap[toChainTokenAddress(token0.address).toLowerCase()]
	);
	const token1SupportsPermit = Boolean(
		token1 &&
		!isNativeTokenAddress(token1.address) &&
		permitSupportMap[toChainTokenAddress(token1.address).toLowerCase()]
	);

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

	// 判断是否需要包装ETH
	const needsWrap0 = useMemo(() => {
		if (!token0 || !isNativeTokenAddress(token0.address) || !token0Balance || !amount0)
			return false;
		try {
			return parseUnits(amount0, token0.decimals) > token0Balance.value;
		} catch {
			return false;
		}
	}, [token0, token0Balance, amount0]);
	const needsWrap1 = useMemo(() => {
		if (!token1 || !isNativeTokenAddress(token1.address) || !token1Balance || !amount1)
			return false;
		try {
			return parseUnits(amount1, token1.decimals) > token1Balance.value;
		} catch {
			return false;
		}
	}, [token1, token1Balance, amount1]);

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
	const getErrorMessage = useCallback((error: unknown) => {
		if (error instanceof BaseError) {
			return error.shortMessage || error.message;
		}

		if (error instanceof Error) {
			return error.message;
		}

		return '交易提交失败';
	}, []);
	const setTransactionAction = (action: TransactionAction) => {
		onSetStep(action);
	};
	// 获取预估Gas费
	const writeContractWithEstimatedGas = useCallback(
		async ({
			address: contractAddress,
			abi,
			functionName,
			args,
			value,
		}: ContractWriteParams) => {
			if (!address) {
				throw new Error('钱包未连接');
			}

			if (!publicClient) {
				throw new Error('公共客户端未初始化');
			}

			const estimatedGas = await publicClient.estimateContractGas({
				account: address,
				address: contractAddress,
				abi,
				functionName,
				args,
				value,
			} as never);

			const gas = (estimatedGas * 12n) / 10n;

			writeContract({
				account: address,
				address: contractAddress,
				abi,
				functionName,
				args,
				value,
				gas: gas > GAS_LIMIT_CAP ? GAS_LIMIT_CAP : gas,
			} as never);
		},
		[address, publicClient, writeContract]
	);
	const wrapToken = useCallback(
		async (token: Token, amount: string, currentWrappedBalance?: bigint) => {
			if (!address || !isNativeTokenAddress(token.address)) return;

			try {
				const desiredAmount = parseUnits(amount, token.decimals);
				const wrappedBalance = currentWrappedBalance ?? BigInt(0);
				const wrapAmount =
					desiredAmount > wrappedBalance ? desiredAmount - wrappedBalance : BigInt(0);

				if (wrapAmount <= 0) return;

				setTransactionAction(token.address === token0?.address ? 'wrap0' : 'wrap1');
				setTransactionError(null);

				await writeContractWithEstimatedGas({
					address: tokens.ETH.wrappedAddress as `0x${string}`,
					abi: WETH_ABI,
					functionName: 'deposit',
					args: [],
					value: wrapAmount,
				});
			} catch (error) {
				setTransactionAction(null);
				setTransactionError(getErrorMessage(error));
			}
		},
		[address, token0?.address, writeContractWithEstimatedGas, getErrorMessage]
	);

	// 授权代币
	const approveToken = useCallback(
		async (tokenAddress: string, amount: string, decimals: number) => {
			if (!address) return;

			try {
				const amountWei = parseUnits(amount, decimals);
				const actualTokenAddress = toChainTokenAddress(tokenAddress);
				setTransactionAction(tokenAddress === token0?.address ? 'approve0' : 'approve1');
				setTransactionError(null);

				await writeContractWithEstimatedGas({
					address: actualTokenAddress as `0x${string}`,
					abi: ERC20_ABI,
					functionName: 'approve',
					args: [contracts.META_NODE_MANAGER as `0x${string}`, amountWei],
				});
			} catch (error) {
				setTransactionAction(null);
				setTransactionError(getErrorMessage(error));
			}
		},
		[address, token0?.address, writeContractWithEstimatedGas, getErrorMessage]
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
	const handleMaxAmount1 = () => {
		const maxBalance =
			token1 && isNativeTokenAddress(token1.address) ? nativeBalance : token1Balance;
		if (maxBalance) {
			setAmount1(maxBalance.formatted);
			calculateAmount('token1', maxBalance.formatted);
		}
	};

	// 检查授权
	const checkAllowance = useCallback(async () => {
		if (!address || !token0 || !token1 || !amount0 || !amount1) {
			setNeedsApproval0(false);
			setNeedsApproval1(false);
			return;
		}

		try {
			setIsCheckingAllowance(true);
			setTransactionError(null);
			const allowance0Response = await fetch('/api/allowance', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					token: toChainTokenAddress(token0.address),
					owner: address,
					spender: contracts.META_NODE_MANAGER,
				}),
			}).then((res) => res.json());

			const allowance1Response = await fetch('/api/allowance', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					token: toChainTokenAddress(token1.address),
					owner: address,
					spender: contracts.META_NODE_MANAGER,
				}),
			}).then((res) => res.json());

			if (allowance0Response.success && allowance1Response.success) {
				const amountWei0 = parseUnits(amount0, token0.decimals);
				const amountWei1 = parseUnits(amount1, token1.decimals);
				const canSkipApprove0 = ENABLE_PERMIT_LIQUIDITY && token0SupportsPermit;
				const canSkipApprove1 = ENABLE_PERMIT_LIQUIDITY && token1SupportsPermit;

				setNeedsApproval0(
					!canSkipApprove0 && BigInt(allowance0Response.allowance) < amountWei0
				);
				setNeedsApproval1(
					!canSkipApprove1 && BigInt(allowance1Response.allowance) < amountWei1
				);
			}
		} catch (error) {
			console.error('检查授权失败:', error);
			// API 异常时采用保守策略：默认需要授权，避免直接发交易后在链上失败
			setNeedsApproval0(Boolean(token0 && !isNativeTokenAddress(token0.address)));
			setNeedsApproval1(Boolean(token1 && !isNativeTokenAddress(token1.address)));
		} finally {
			setIsCheckingAllowance(false);
		}
	}, [address, token0, token1, amount0, amount1, token0SupportsPermit, token1SupportsPermit]);

	useEffect(() => {
		checkAllowance();
	}, [amount0, amount1, token0, token1, address, checkAllowance]);
	return (
		<div>
			{/*池子状态及费率展示*/}
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
						<span className="text-sm whitespace-nowrap text-muted-foreground">
							1 {token0.symbol} =
						</span>
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
							<span className="text-sm text-muted-foreground">
								{t('swap.token', { index: 0 })}
							</span>
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
											{t('swap.max')}
										</button>
									)}
							</div>
						</div>
						<div className="flex items-center justify-between p-4 bg-muted rounded-lg">
							<Input
								type="text"
								allowClear
								value={amount0}
								onChange={(e) => handleAmount0Change(e.target.value)}
								placeholder="0"
								className="flex-1 overflow-x-auto text-2xl font-medium bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
							/>
							<div className="whitespace-nowrap px-3 py-2 bg-secondary rounded-lg">
								<span className="font-medium text-secondary-foreground">
									{token0.symbol}
								</span>
							</div>
						</div>
					</div>

					{/* Token1 Input */}
					<div className="mb-6">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-muted-foreground">
								{t('swap.token', { index: 1 })}
							</span>
							<div className="flex items-center space-x-2">
								<span className="text-sm text-muted-foreground">
									{t('swap.balance')}:{' '}
									{token1 && isNativeTokenAddress(token1.address)
										? nativeBalance
											? formatNumber(Number(nativeBalance.formatted))
											: '0'
										: token1Balance
											? formatNumber(Number(token1Balance.formatted))
											: '0'}
								</span>
								{(token1 && isNativeTokenAddress(token1.address)
									? nativeBalance
									: token1Balance) &&
									parseFloat(
										(token1 && isNativeTokenAddress(token1.address)
											? nativeBalance
											: token1Balance)!.formatted
									) > 0 && (
										<button
											onClick={handleMaxAmount1}
											className="text-xs text-primary hover:text-primary/80 font-medium"
										>
											{t('swap.max')}
										</button>
									)}
							</div>
						</div>
						<div className="flex items-center justify-between p-4 bg-muted rounded-lg">
							<div className="flex items-center flex-1 overflow-x-auto scrollbar-none">
								<div className="text-2xl font-medium text-foreground w-full">
									{isCalculating ? (
										<div className="flex items-center">
											<Clock className="w-4 h-4 animate-spin mr-2 text-muted-foreground" />
											<span className="text-muted-foreground">
												{t('swap.calculating')}
											</span>
										</div>
									) : (
										<Input
											value={amount1}
											disabled
											placeholder="0"
											className="flex-1 disabled:text-white disabled:opacity-100 overflow-x-auto text-2xl font-medium bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
										/>
									)}
								</div>
							</div>
							<div className="px-3 py-2 bg-secondary rounded-lg">
								<span className="font-medium text-secondary-foreground">
									{token1.symbol}
								</span>
							</div>
						</div>
						{priceError && (
							<div className="mt-2 text-xs text-red-600 dark:text-red-400">
								⚠️ {priceError}
							</div>
						)}
						<div className="mt-4">
							{!isConnected ? (
								<button
									disabled
									className="w-full py-4 rounded-lg font-medium text-lg bg-muted text-muted-foreground cursor-not-allowed"
								>
									{t('swap.pleaseConnectWallet')}
								</button>
							) : needsWrap0 ? (
								<button
									onClick={() => wrapToken(token0, amount0, token0Balance?.value)}
									disabled={
										isPending ||
										isConfirming ||
										hasInsufficientBalance0 ||
										!amount0
									}
									className={cn(
										'w-full py-4 rounded-lg font-medium text-lg transition-colors',
										isPending ||
											isConfirming ||
											hasInsufficientBalance0 ||
											!amount0
											? 'bg-muted text-muted-foreground cursor-not-allowed'
											: 'bg-blue-500 hover:bg-blue-600 text-white'
									)}
								>
									{isPending || isConfirming
										? '包装中...'
										: `先将 ETH 包装为 WETH`}
								</button>
							) : needsWrap1 ? (
								<button
									onClick={() => wrapToken(token1, amount1, token1Balance?.value)}
									disabled={
										isPending ||
										isConfirming ||
										hasInsufficientBalance1 ||
										!amount1
									}
									className={cn(
										'w-full py-4 rounded-lg font-medium text-lg transition-colors',
										isPending ||
											isConfirming ||
											hasInsufficientBalance1 ||
											!amount1
											? 'bg-muted text-muted-foreground cursor-not-allowed'
											: 'bg-blue-500 hover:bg-blue-600 text-white'
									)}
								>
									{isPending || isConfirming
										? '包装中...'
										: `先将 ETH 包装为 WETH`}
								</button>
							) : needsApproval0 ? (
								<button
									onClick={() =>
										approveToken(token0.address, amount0, token0.decimals)
									}
									disabled={
										isPending ||
										isConfirming ||
										isCheckingAllowance ||
										hasInsufficientBalance0 ||
										!amount0
									}
									className={cn(
										'w-full py-4 rounded-lg font-medium text-lg transition-colors',
										isPending ||
											isConfirming ||
											isCheckingAllowance ||
											hasInsufficientBalance0 ||
											!amount0
											? 'bg-muted text-muted-foreground cursor-not-allowed'
											: 'bg-yellow-500 hover:bg-yellow-600 text-white'
									)}
								>
									{isPending || isConfirming
										? '授权中...'
										: isCheckingAllowance
											? '检查授权中...'
											: `授权 ${token0.symbol}`}
								</button>
							) : needsApproval1 ? (
								<button
									onClick={() =>
										approveToken(token1.address, amount1, token1.decimals)
									}
									disabled={
										isPending ||
										isConfirming ||
										isCheckingAllowance ||
										hasInsufficientBalance1 ||
										!amount1
									}
									className={cn(
										'w-full py-4 rounded-lg font-medium text-lg transition-colors',
										isPending ||
											isConfirming ||
											isCheckingAllowance ||
											hasInsufficientBalance1 ||
											!amount1
											? 'bg-muted text-muted-foreground cursor-not-allowed'
											: 'bg-yellow-500 hover:bg-yellow-600 text-white'
									)}
								>
									{isPending || isConfirming
										? '授权中...'
										: isCheckingAllowance
											? '检查授权中...'
											: `授权 ${token1.symbol}`}
								</button>
							) : null}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
