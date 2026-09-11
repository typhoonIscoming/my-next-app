'use client';
import { use, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import CustomConnectButton from '@/app/components/CustomConnectButton';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import { MoveDown, RotateCw, ArrowBigDown } from 'lucide-react';
import { parseUnits, type Address } from 'viem';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDebouncedCallback } from 'use-debounce';
import { cn, tokenList } from '@/lib/utils';
import Input from '@mui/material/Input';
import { toast } from 'sonner';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { useSwapRoute } from '../hooks/useSwapRoute';
import { swapRouterAbi } from '../hooks/abi';
import { swapAddress } from '@/lib/utils';

const MAX_RPC_GAS_LIMIT = 16_777_216n;
const MIN_SQRT_PRICE_X96 = 4_295_128_739n;
const MAX_SQRT_PRICE_X96 = 146_144_670_348_521_010_328_727_305_220_398_882_237_184_430n;

const getValidSqrtPriceLimitX96 = (
	currentSqrtPriceX96: bigint | undefined,
	tokenIn: Address,
	tokenOut: Address
) => {
	const price = currentSqrtPriceX96 ?? MIN_SQRT_PRICE_X96 + 1n;
	const zeroForOne = tokenIn.toLowerCase() < tokenOut.toLowerCase();

	if (zeroForOne) {
		const candidate = price > MIN_SQRT_PRICE_X96 + 1n ? price - 1n : MIN_SQRT_PRICE_X96 + 1n;
		return candidate < MAX_SQRT_PRICE_X96 ? candidate : MAX_SQRT_PRICE_X96 - 1n;
	}

	const candidate = price < MAX_SQRT_PRICE_X96 - 1n ? price + 1n : MAX_SQRT_PRICE_X96 - 1n;
	return candidate > MIN_SQRT_PRICE_X96 ? candidate : MIN_SQRT_PRICE_X96 + 1n;
};

const addPositionSchema = (validateMessages: {
	selectToken: string;
	enterValidAmount: string;
	amountMustBeGreaterThanZero: string;
}) => {
	return z.object({
		pair: z
			.array(z.string().min(1, validateMessages.selectToken))
			.length(2, validateMessages.selectToken)
			.refine((value) => value[0] !== value[1], {
				message: validateMessages.selectToken,
			}),
		amount0: z.string().regex(/^(|\d+(\.\d*)?|\.\d+)$/, validateMessages.enterValidAmount),
		amount1: z.string().regex(/^(|\d+(\.\d*)?|\.\d+)$/, validateMessages.enterValidAmount),
	});
};

type AddPositionFormValues = z.infer<ReturnType<typeof addPositionSchema>>;

export default function SwapContent() {
	const t = useTranslations();
	const { address } = useAccount();
	const publicClient = usePublicClient();
	const { writeContractAsync } = useWriteContract();
	const validateMessages = {
		selectToken: t('swap.selectToken0'),
		enterValidAmount: t('swap.invalidNumber'),
		amountMustBeGreaterThanZero: t('swap.invalidAmount'),
	};

	const form = useForm<AddPositionFormValues>({
		resolver: zodResolver(addPositionSchema(validateMessages)),
		defaultValues: {
			pair: [],
			// pair: [tokenList[0].address, tokenList[1].address],
			amount0: '',
			amount1: '',
		},
	});
	const watchedPair = form.watch('pair');
	const selectedToken0Address = watchedPair?.[0] as `0x${string}` | undefined;
	const selectedToken1Address = watchedPair?.[1] as `0x${string}` | undefined;
	const { getCandidatePools, quoteExactInput, quoteExactOutput } = useSwapRoute();
	const {
		formatted: token0Balance,
		isLoading: isToken0BalanceLoading,
		refetch,
	} = useTokenBalance(selectedToken0Address, { decimals: 18 });

	// 当用户选择了token0、token1、且输入了token0的数量后，去获取预估token1的数量
	const handleToken0AmountChange = useDebouncedCallback(
		async (amount: string, isChangeSell: boolean) => {
			if (!selectedToken0Address || !selectedToken1Address) return;
			if (!amount) return;

			const candidatePools = await getCandidatePools(
				isChangeSell ? selectedToken0Address : selectedToken1Address
			);
			// 获取到匹配的交易对，且取流动性最大的交易对
			type PoolItem = {
				token0: string;
				token1: string;
				index: number;
				liquidity: BigInt;
				sqrtPriceX96: BigInt;
			};
			const matchedPool = candidatePools.reduce((prev, pool: PoolItem) => {
				const isPair =
					pool.token0.toLowerCase() === selectedToken0Address.toLowerCase() &&
					pool.token1.toLowerCase() === selectedToken1Address.toLowerCase();
				if (isPair) {
					if (prev) {
						return prev.liquidity > pool.liquidity ? prev : pool;
					}
					return pool;
				}
				return prev;
			}, null);
			console.log('matchedPool', matchedPool, amount);
			if (!matchedPool) {
				console.log('No matched pool found');
				return;
			}
			if (isChangeSell) {
				const result = await quoteExactInput({
					tokenIn: selectedToken0Address,
					tokenOut: selectedToken1Address,
					indexPath: matchedPool.index,
					amountIn: `${parseUnits(amount, 18)}`,
					sqrtPriceLimitX96: matchedPool.sqrtPriceX96 - 1n,
				});
				console.log('result', result);
				form.setValue('amount1', `${result}`);
				return;
			} else {
				console.log('amount', amount);
				const result = await quoteExactOutput({
					tokenIn: selectedToken1Address,
					tokenOut: selectedToken0Address,
					poolIndex: matchedPool.index,
					amountOut: amount,
					sqrtPriceLimitX96: matchedPool.sqrtPriceX96 + 1n,
				});
				console.log('quoteExactOutput result', result);
				form.setValue('amount0', `${result}`);
			}
			// const amount1 = Number(quoted.toString()) / 1e18;
			// form.setValue('amount1', amount1, { shouldValidate: true });
		},
		500
	);

	useEffect(() => {
		if (form.getValues('amount0')) {
			handleToken0AmountChange(form.getValues('amount0'), true);
		}
	}, [selectedToken0Address, selectedToken1Address]);

	const handleSubmit = form.handleSubmit(
		async (values) => {
			try {
				if (!address) {
					toast.error('请先连接钱包');
					return;
				}

				const [tokenIn, tokenOut] = form.getValues('pair') as [Address, Address];
				if (!tokenIn || !tokenOut || tokenIn === tokenOut) {
					toast.error('请选择有效的交易对');
					return;
				}

				const rawAmount0 = values.amount0.trim();
				const numericAmount0 = Number(rawAmount0);
				if (rawAmount0 === '' || !Number.isFinite(numericAmount0) || numericAmount0 <= 0) {
					toast.error('输入金额必须大于 0');
					return;
				}

				const candidatePools = await getCandidatePools(tokenIn);
				const matchedPool = candidatePools.find(
					(pool: { token0: string; token1: string; index: number | string }) =>
						pool.token0.toLowerCase() === tokenOut.toLowerCase() ||
						pool.token1.toLowerCase() === tokenOut.toLowerCase()
				);

				if (!matchedPool) {
					toast.error('当前交易对没有可用池');
					return;
				}

				const amountIn = parseUnits(rawAmount0, 18);
				if (amountIn <= 0n) {
					toast.error('输入金额必须大于 0');
					return;
				}
				console.log('matchedPool', matchedPool);
				const exactInputParams = {
					tokenIn,
					tokenOut,
					indexPath: [Number(matchedPool.index)],
					recipient: address,
					deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
					amountIn,
					amountOutMinimum: 0n,
					sqrtPriceLimitX96: getValidSqrtPriceLimitX96(
						BigInt(matchedPool.sqrtPriceX96 ?? 0),
						tokenIn,
						tokenOut
					),
				};
				// 执行swap的预估gas
				const estimatedSwapGas = publicClient
					? await publicClient.estimateContractGas({
							address: swapAddress,
							account: address,
							abi: swapRouterAbi,
							functionName: 'exactInput',
							args: [exactInputParams],
						})
					: 16777216n;
				console.log('预估swap gas', estimatedSwapGas);
				const txHash = await writeContractAsync({
					address: swapAddress,
					abi: swapRouterAbi,
					functionName: 'exactInput',
					args: [exactInputParams],
					gas:
						estimatedSwapGas > MAX_RPC_GAS_LIMIT ? MAX_RPC_GAS_LIMIT : estimatedSwapGas,
				});

				// toast.success(`Swap submitted: ${txHash}`);
				// console.log('swap txHash', txHash);
			} catch (error: any) {
				console.error(error);
				toast.error(error?.shortMessage || error?.message || 'Swap failed');
			}
		},
		(err: { [key: string]: { message?: string } }) => {
			if (!err) return;
			console.log(err);
			for (let key in err) {
				toast.error(err[key]?.message || '发生错误');
				break;
			}
		}
	);

	const debouncedHandleSubmit = useDebouncedCallback(() => {
		void handleSubmit();
	}, 400);

	// 交换两个token的位置
	const handleExchange = () => {
		form.setValue('pair', [form.getValues('pair')[1], form.getValues('pair')[0]]);
		const amount0 = form.getValues('amount0');
		const amount1 = form.getValues('amount1');
		form.setValue('amount0', amount1);
		form.setValue('amount1', amount0);
	};
	// 刷新余额
	const handleRefreshToken0Balance = async () => {
		await refetch();
	};

	return (
		<div className="w-full max-w-125 rounded-[32px] backdrop-blur-2xl">
			<div className="rounded-[28px] p-4">
				<div className="mb-4 flex items-center justify-between px-2 py-1">
					<div className="flex items-center gap-2 text-sm font-semibold text-white">
						<span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
						{t('swap.title')}
					</div>
				</div>
				<Form form={form} onSubmit={() => {}}>
					<div className="flex flex-col gap-1">
						<div className="rounded-[24px] border border-white/8 bg-[#161f33] p-4 pb-6">
							<div className="mb-3 flex items-center justify-between text-[16px] font-bold uppercase tracking-[0.2em] text-[#ffffffa6]">
								<span>{t('swap.sell')}</span>
								<Box className="flex items-center gap-2 text-[11px] normal-case tracking-normal text-slate-300">
									{isToken0BalanceLoading ? (
										<Box>{t('swap.loading')}</Box>
									) : (
										<Box className="flex items-center">
											{`${t('swap.balance')}: ${token0Balance}`}
										</Box>
									)}
									<RotateCw
										size={18}
										className={cn(
											'cursor-pointer',
											isToken0BalanceLoading && 'animate-spin'
										)}
										onClick={handleRefreshToken0Balance}
									/>
								</Box>
							</div>
							<div className="flex items-center justify-between gap-4">
								<div className="text-[2.2rem] flex-1 font-medium tracking-[-0.07em] text-white">
									<FormField control={form.control} name="amount0">
										{({ value, onChange, onBlur, error }) => {
											const displayValue =
												typeof value === 'string'
													? value
													: typeof value === 'number' &&
														  Number.isFinite(value)
														? String(value)
														: '';
											return (
												<CustomNumberInput
													value={displayValue}
													placeholder={t('swap.pleaseInput', {
														type: t('swap.sell'),
													})}
													onChange={(value) => {
														onChange?.(value);
														handleToken0AmountChange(value, true);
													}}
													onBlur={onBlur}
												/>
											);
										}}
									</FormField>
								</div>
								<div className="flex items-center justify-end">
									<FormField control={form.control} name="pair">
										{({ value, onChange, onBlur, error }) => {
											const originValue = Array.isArray(value) ? value : [];
											const selectedValue = originValue[0] || '';
											return (
												<Select
													value={selectedValue}
													onValueChange={(v) =>
														onChange?.([v, originValue[1]])
													}
												>
													<SelectTrigger className="border-none bg-none bg-transparent! font-bold text-xl">
														<SelectValue
															placeholder={t('swap.selectToken')}
															className="text-white font-bold"
														/>
													</SelectTrigger>
													<SelectContent>
														{tokenList.map((item) => (
															<SelectItem
																key={item.address}
																value={item.address}
																className="text-white cursor-pointer focus:bg-white/10"
															>
																{item.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											);
										}}
									</FormField>
								</div>
							</div>
						</div>

						<div className="relative w-full">
							<button
								onClick={handleExchange}
								className="absolute left-[50%] cursor-pointer translate-y-[-50%] translate-x-[-50%] rounded-[16px] z-10 flex h-11 w-11 items-center justify-center border-4 border-[#131313] bg-[#151b2b] text-xl transition"
							>
								<SvgIcon
									component={ArrowBigDown}
									sx={{ color: '#ffffff', fontSize: 24 }}
									inheritViewBox
								/>
							</button>
						</div>

						<div className="rounded-[24px] border border-white/8 bg-[#161f33] p-4">
							<div className="mb-3 flex items-center justify-between text-[16px] font-bold uppercase tracking-[0.2em] text-[#ffffffa6]">
								<span>{t('swap.buy')}</span>
							</div>
							<div className="flex items-center justify-between gap-4">
								<div className="flex items-center justify-between gap-4">
									<div className="text-[2.2rem] flex-1 font-medium tracking-[-0.07em] text-white">
										<FormField control={form.control} name="amount1">
											{({ value, onChange, onBlur, error }) => {
												const numberValue =
													typeof value === 'string'
														? value
														: typeof value === 'number' &&
															  Number.isFinite(value)
															? String(value)
															: '';
												return (
													<CustomNumberInput
														value={numberValue}
														placeholder={t('swap.pleaseInput', {
															type: t('swap.buy'),
														})}
														onChange={(v) => {
															onChange?.(v);
															handleToken0AmountChange(v, false);
														}}
														onBlur={onBlur}
													/>
												);
											}}
										</FormField>
									</div>
									<div className="flex items-center justify-end">
										<FormField control={form.control} name="pair">
											{({ value, onChange, onBlur, error }) => {
												const originValue = Array.isArray(value)
													? value
													: [];
												const selectedValue = Array.isArray(value)
													? value[1]
													: '';
												return (
													<Select
														value={selectedValue}
														onValueChange={(v) =>
															onChange?.([originValue[0], v])
														}
													>
														<SelectTrigger className="border-none bg-none bg-transparent! font-bold text-xl">
															<SelectValue
																placeholder={t('swap.selectToken')}
																className="text-white font-bold"
															/>
														</SelectTrigger>
														<SelectContent>
															{tokenList.map((item) => (
																<SelectItem
																	key={item.address}
																	value={item.address}
																	className="text-white cursor-pointer focus:bg-white/10"
																>
																	{item.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												);
											}}
										</FormField>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Form>
				<CustomConnectButton>
					{({ connected, chain, account, openAccountModal, openConnectModal }) => {
						// console.log('chain', connected, chain, account);
						// address只显示前后共4位
						// const shortAddress = account
						// 	? `${account.address.slice(0, 4)}...${account.address.slice(-4)}`
						// 	: '';
						return !connected ? (
							<Button
								onClick={openConnectModal}
								className="w-full rounded-full! mt-5! text-white! hover:text-(--swap-hover-background)! bg-(--swap-background)!"
							>
								{t('swap.connectWallet')}
							</Button>
						) : (
							<Button
								className="mt-5! flex w-full items-center justify-center rounded-full! px-5 py-4 text-base font-semibold text-black/80! transition bg-[linear-gradient(135deg,#6fe8ff,#4bd3bd_35%,#2dbf9a)]! hover:brightness-110"
								onClick={debouncedHandleSubmit}
							>
								{t('swap.reviewSwap')}
							</Button>
						);
					}}
				</CustomConnectButton>
			</div>
		</div>
	);
}

function CustomNumberInput(props: {
	value: string;
	onChange?: (value: string) => void;
	onBlur?: () => void;
	placeholder?: string;
}) {
	return (
		<Input
			type="text"
			inputMode="decimal"
			value={props.value ?? ''}
			placeholder={props.placeholder}
			onChange={(e) => {
				const rawValue = e.target.value;
				if (rawValue === '') {
					props.onChange?.('');
					return;
				}
				if (rawValue.startsWith('-')) {
					return;
				}
				if (!/^(\d+(\.\d*)?|\.\d+)$/.test(rawValue)) {
					return;
				}
				props.onChange?.(rawValue);
			}}
			onBlur={(e) => {
				const rawValue = e.target.value;
				if (rawValue === '') {
					props.onChange?.('');
					props.onBlur?.();
					return;
				}
				if (rawValue.startsWith('-') || !/^(\d+(\.\d*)?|\.\d+)$/.test(rawValue)) {
					props.onChange?.('');
					props.onBlur?.();
					return;
				}
				props.onBlur?.();
			}}
			sx={{
				'& input': {
					color: 'white',
					fontSize: '2.2rem',
					fontWeight: 500,
					letterSpacing: '-0.07em',
					backgroundColor: 'transparent',
					border: 'none',
					outline: 'none',
				},
				'& input::placeholder': {
					fontSize: '1.2rem',
					letterSpacing: '-0.07em',
					color: 'rgba(255,255,255,0.45)',
				},
				// 针对 Webkit 内核浏览器（Chrome, Safari, Edge 等）
				'& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button':
					{
						WebkitAppearance: 'none',
						margin: 0,
					},
				// 针对 Firefox 浏览器
				'& input[type=number]': {
					MozAppearance: 'textfield',
				},
				'&::after': {
					// borderBottomColor: '#ffffff',
				},
				'&::before': {
					borderBottomColor: 'transparent',
				},
				'&:hover::before': {
					opacity: 0,
					borderBottomColor: '#ffffff',
				},
			}}
			className="text-[2.2rem] w-full font-medium tracking-[-0.07em] bg-transparent border-none outline-none"
		/>
	);
}
