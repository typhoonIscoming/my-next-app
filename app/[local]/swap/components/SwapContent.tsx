'use client';
import { use, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import CustomConnectButton from '@/app/components/CustomConnectButton';
import Button from '@mui/material/Button';
import SvgIcon from '@mui/material/SvgIcon';
import { MoveDown, RotateCw, ArrowBigDown } from 'lucide-react';
import { formatUnits, parseUnits, type Address } from 'viem';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { Form, FormField } from '@/components/ui/form';
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
import { useSwapPoolSelection } from '../hooks/useSwapPoolSelection';
import { swapRouterAbi } from '../hooks/abi';
import { swapAddress } from '@/lib/utils';
import { useReadToken } from '../hooks/useReadPool';
import { LoaderCircle } from 'lucide-react'

const isEmpty = (value: any) => value === null || value === undefined || value === '';

const MAX_RPC_GAS_LIMIT = 16_777_216n;

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
    const [tokenInfo, setTokenInfo] = useState<Map<`0x${string}`, { decimals: number }>>(new Map());
    const [isFetchingTokenInfo, setIsFetchingTokenInfo] = useState(false);
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
	const selectedToken0Address = watchedPair?.[0] as `0x${string}`;
    const selectedToken1Address = watchedPair?.[1] as `0x${string}`;
    const token0Amount = form.watch('amount0');

	const { getCandidatePools, quoteExactInput, quoteExactOutput } = useSwapRoute();
	const { getValidSqrtPriceLimitX96, getBestPoolForExactInput, getBestPoolForExactOutput } =
		useSwapPoolSelection();
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
            if (isChangeSell) {
                setIsFetchingTokenInfo(true)
				const bestQuote = await getBestPoolForExactInput({
					candidatePools,
					tokenIn: selectedToken0Address,
					tokenOut: selectedToken1Address,
					amountIn: amount,
					quoteExactInput,
				});
                setIsFetchingTokenInfo(false);
				if (!bestQuote?.pool) {
					console.log('No valid pool found for exact input');
					return;
				}

				console.log('bestQuote', bestQuote);
				form.setValue('amount1', `${bestQuote.amountOut}`);
				return;
			}
            setIsFetchingTokenInfo(true);
			const bestQuote = await getBestPoolForExactOutput({
				candidatePools,
				tokenIn: selectedToken1Address,
				tokenOut: selectedToken0Address,
				amountOut: amount,
				quoteExactOutput,
			});
            setIsFetchingTokenInfo(false);
			console.log('bestQuote', bestQuote);

			if (!bestQuote?.pool) {
				console.log('No valid pool found for exact output');
				return;
			}

			form.setValue('amount0', `${bestQuote.amountIn}`);
			// const amount1 = Number(quoted.toString()) / 1e18;
			// form.setValue('amount1', amount1, { shouldValidate: true });
		},
		500
	);
    const { data: token0Data, isLoading: isToken0Loading, error: token0Error, refetch: refetchToken0 } = useReadToken(selectedToken0Address);
    const { data: token1Data, isLoading: isToken1Loading, error: token1Error, refetch: refetchToken1 } = useReadToken(selectedToken1Address);
    // console.log('token0Data', token0Data, 'token1Data', token1Data);
	useEffect(() => {
		if (form.getValues('amount0')) {
			handleToken0AmountChange(form.getValues('amount0'), true);
		}
		// 获取选择的代币的精度，而不是页面固定写死
		const token0Decimals = tokenInfo.get(selectedToken0Address)?.decimals;
		const token1Decimals = tokenInfo.get(selectedToken1Address)?.decimals;
		if (selectedToken0Address && !token0Decimals) {
			refetchToken0();
			if (token0Data) {
				setTokenInfo((prev) =>
					new Map(prev).set(selectedToken0Address, { decimals: Number(token0Data) })
				);
			}
		}
		if (selectedToken1Address && !token1Decimals) {
			refetchToken1();
			if (token1Data) {
				setTokenInfo((prev) =>
					new Map(prev).set(selectedToken1Address, { decimals: Number(token1Data) })
				);
			}
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
				const bestPoolQuote = await getBestPoolForExactInput({
					candidatePools,
					tokenIn,
					tokenOut,
					amountIn: rawAmount0,
					quoteExactInput,
				});

				if (!bestPoolQuote?.pool) {
					toast.error('当前交易对没有可用池');
					return;
				}

				const amountIn = parseUnits(rawAmount0, 18);
				if (amountIn <= 0n) {
					toast.error('输入金额必须大于 0');
					return;
				}
				console.log('bestPoolQuote', bestPoolQuote);
				const exactInputParams = {
					tokenIn,
					tokenOut,
					indexPath: [Number(bestPoolQuote.pool.index)],
					recipient: address,
					deadline: BigInt(Math.floor(Date.now() / 1000) + 3600),
					amountIn,
					amountOutMinimum: 0n,
					sqrtPriceLimitX96: getValidSqrtPriceLimitX96(
						BigInt(bestPoolQuote.pool.sqrtPriceX96 ?? 0),
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
        if (isFetchingTokenInfo) return;
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
						return !connected ? (
							<Button
								onClick={openConnectModal}
								className="w-full rounded-full! mt-5! text-white! hover:text-(--swap-hover-background)! bg-(--swap-background)!"
							>
								{t('swap.connectWallet')}
							</Button>
                        ) :
                            isEmpty(token0Amount) ? (
                                <Button
                                    startIcon={isFetchingTokenInfo ? <LoaderCircle className="animate-spin" /> : null}
                                    className="mt-5! flex w-full items-center justify-center rounded-full! px-5 py-4 text-base font-semibold transition text-white! hover:text-(--swap-hover-background)! bg-(--swap-background)!"
                                >
                                    {t('swap.addAccount')}
                                </Button>
                            ) : !isEmpty(token0Balance) && token0Balance <= (token0Amount ?? 0) ? (
                                <Button
                                    className="mt-5! flex w-full items-center justify-center rounded-full! px-5 py-4 text-base font-semibold transition text-white! hover:text-(--swap-hover-background)! bg-(--swap-background)!"
                                >
                                    {t('swap.insufficientFunds')}
                                </Button>
                            ) : (
                            <Button
                                startIcon={isFetchingTokenInfo ? <LoaderCircle className="animate-spin" /> : null}
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
