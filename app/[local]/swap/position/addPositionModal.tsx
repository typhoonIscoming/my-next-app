'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { tokenList } from '@/lib/utils';
import { parseUnits } from 'viem';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import Box from '@mui/material/Box';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAddPosition } from '../hooks/useAddPosition';
import { usePoolFees } from '../hooks/usePoolFees';
import { useReadPool } from '../hooks/useReadPool';

const addPositionSchema = () =>
	z.object({
		pair: z
			.array(z.string().min(1, '请选择交易对'))
			.length(2, '请选择两个代币组成交易对')
			.refine((value) => value[0] !== value[1], {
				message: '交易对两个值不能相同',
			}),
		fee: z.coerce
			.number({ invalid_type_error: '请输入有效的手续费' })
			.positive('手续费必须大于 0'),
		amount0: z.coerce
			.number({ invalid_type_error: '请输入有效的数量' })
			.positive('数量必须大于 0'),
		amount1: z.coerce
			.number({ invalid_type_error: '请输入有效的数量' })
			.positive('数量必须大于 0'),
	});
type AddPositionFormValues = z.infer<ReturnType<typeof addPositionSchema>>;
type AddPositionFormHandle = {
	submit: () => void;
	reset: () => void;
	trigger: () => Promise<boolean>;
	getValues: () => AddPositionFormValues;
};

export default function AddPositionModal() {
	const t = useTranslations();
	const [open, setOpen] = useState(true);
	const { addPosition, isPending } = useAddPosition();
	const { data: pools = [] } = useReadPool();

	const form = useForm<AddPositionFormValues>({
		resolver: zodResolver(addPositionSchema()),
		defaultValues: {
			pair: [tokenList[0].address, tokenList[1].address],
			fee: 0,
			amount0: 0,
			amount1: 0,
		},
	});

	const selectedPair = form.watch('pair');
	const [token0Address, token1Address] = selectedPair ?? [undefined, undefined];
	const { fees } = usePoolFees(token0Address, token1Address);
	const setPairError = (message: string) => {
		form.setError('pair', {
			type: 'manual',
			message,
		});
	};
	// 对fees进行去重
	const uniqueFees = Array.from(new Set(fees));
	// console.log('fee', fees);
	const handleSubmit = form.handleSubmit(async (values) => {
		try {
			const [token0, token1] = values.pair;
			const feePercent = Number(values.fee || 0);
			if (!token0 || !token1) {
				toast.error('请选择交易对');
				return;
			}
			if (!feePercent) {
				toast.error('请选择手续费');
				return;
			}
			if (
				uniqueFees.length > 0 &&
				!uniqueFees.includes(Number((feePercent || 0).toFixed(2)))
			) {
				toast.error('当前交易对下没有该手续费池，请重新选择');
				return;
			}
			if (!values.amount0 || !values.amount1) {
				toast.error('请输入两种代币的授权数量');
				return;
			}

			const matchedPool = (pools as any[]).find((pool) => {
				const poolFee = Number(pool?.fee ?? 0);
				const expectedFee = Math.round(feePercent * 10000);
				return (
					pool?.token0?.toLowerCase() === token0.toLowerCase() &&
					pool?.token1?.toLowerCase() === token1.toLowerCase() &&
					poolFee === expectedFee
				);
			});

			if (!matchedPool) {
				toast.error('未找到对应池子，请先创建该交易对池');
				return;
			}

			const index = Number(matchedPool.index ?? 0);
			const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);
			const amount0Desired = parseUnits(String(values.amount0), 18);
			const amount1Desired = parseUnits(String(values.amount1), 18);

			const result = await addPosition({
				token0: token0 as `0x${string}`,
				token1: token1 as `0x${string}`,
				index,
				amount0Desired,
				amount1Desired,
				deadline,
			});
			console.log('add position result', result);
			toast.success('新增头寸成功');
			setOpen(false);
		} catch (error) {
			console.error('add position failed', error);
			toast.error('新增头寸失败，请确认池子已存在且钱包授权足够');
		}
	});

	return (
		<>
			<button
				className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#b29bff,#8a7bff_35%,#4a5df7)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(96,89,255,0.45)] transition hover:brightness-110"
				onClick={() => setOpen(true)}
			>
				+ {t('swap.newPosition')}
			</button>
			<Dialog open={open} maxWidth="sm" fullWidth>
				<DialogTitle>{t('swap.addPosition')}</DialogTitle>
				<DialogContent>
					<Form form={form} onSubmit={() => handleSubmit()}>
						<FormField control={form.control} name="pair">
							{({ value, onChange, onBlur, error }) => {
								const pairValue = Array.isArray(value) ? value : [];

								return (
									<FormItem className="p-3 rounded-xl border border-white/10 bg-[#0d1727] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
										<FormLabel className="text-slate-200">交易对</FormLabel>
										<Box className="flex flex-col md:flex-row gap-4 ">
											<Select
												value={pairValue[0] || undefined}
												onValueChange={(nextValue) => {
													const nextPair = [
														nextValue,
														pairValue[1],
													].filter(Boolean);
													if (nextPair[0] === nextPair[1]) {
														setPairError('交易对两个值不能相同');
														return;
													}
													form.clearErrors('pair');
													onChange?.([nextValue, pairValue[1]]);
												}}
												onOpenChange={(open) => {
													if (!open) onBlur?.();
												}}
											>
												<SelectTrigger
													className="h-10 w-full md:flex-1 rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm text-white outline-none ring-0 data-placeholder:text-slate-400"
													aria-invalid={Boolean(error)}
												>
													<SelectValue placeholder="请选择" />
												</SelectTrigger>
												<SelectContent className="border border-white/10 bg-[#0b1220] text-white">
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
											<Select
												value={pairValue[1] || undefined}
												onValueChange={(nextValue) => {
													const nextPair = [
														pairValue[0],
														nextValue,
													].filter(Boolean);
													if (nextPair[0] === nextPair[1]) {
														setPairError('交易对两个值不能相同');
														toast.error('交易对两个值不能相同');
														return;
													}
													form.clearErrors('pair');
													onChange?.([pairValue[0], nextValue]);
												}}
												onOpenChange={(open) => {
													if (!open) onBlur?.();
												}}
											>
												<SelectTrigger
													className="h-10 w-full md:flex-1 rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm text-white outline-none ring-0 data-placeholder:text-slate-400"
													aria-invalid={Boolean(error)}
												>
													<SelectValue placeholder="请选择" />
												</SelectTrigger>
												<SelectContent className="border border-white/10 bg-[#0b1220] text-white">
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
										</Box>
										<FormMessage />
									</FormItem>
								);
							}}
						</FormField>
						<FormField control={form.control} name="fee">
							{({ value, onChange, onBlur, error }) => {
								const pairValue = typeof value === 'string' ? value : '';

								return (
									<FormItem className="rounded-xl border border-white/10 bg-[#0d1727] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
										<FormLabel className="text-slate-200">手续费</FormLabel>
										<Select
											value={pairValue || undefined}
											onValueChange={(nextValue) => {
												onChange?.(nextValue);
											}}
											onOpenChange={(open) => {
												if (!open) onBlur?.();
											}}
										>
											<SelectTrigger
												className="h-10 w-full rounded-lg border border-white/10 bg-[#0b1220] px-3 text-sm text-white outline-none ring-0 data-placeholder:text-slate-400"
												aria-invalid={Boolean(error)}
											>
												<SelectValue placeholder="请选择" />
											</SelectTrigger>
											<SelectContent className="border border-white/10 bg-[#0b1220] text-white">
												{(uniqueFees.length
													? uniqueFees
													: [0.01, 0.05, 0.3, 1]
												).map((item) => (
													<SelectItem
														key={item}
														value={item.toString()}
														className="text-white cursor-pointer focus:bg-white/10"
													>
														{item}%
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								);
							}}
						</FormField>
						<div className="grid gap-4 md:grid-cols-2">
							<FormField control={form.control} name="amount0">
								{({ value, onChange, onBlur, error }) => {
									const numberValue =
										typeof value === 'number' ? value : value === '' ? 0 : 0;

									return (
										<FormItem className="rounded-xl border border-white/10 bg-[#0d1727] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
											<FormLabel className="text-slate-200">
												代币 A 数量
											</FormLabel>
											<FormControl>
												<Input
													value={numberValue}
													onChange={(event) =>
														onChange?.(Number(event.target.value))
													}
													onBlur={onBlur}
													type="number"
													step="any"
													placeholder="0.00"
													aria-invalid={Boolean(error)}
													className="w-full border-0 bg-transparent text-white shadow-none outline-none placeholder:text-slate-400"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							</FormField>
							<FormField control={form.control} name="amount1">
								{({ value, onChange, onBlur, error }) => {
									const numberValue =
										typeof value === 'number' ? value : value === '' ? 0 : 0;

									return (
										<FormItem className="rounded-xl border border-white/10 bg-[#0d1727] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
											<FormLabel className="text-slate-200">
												代币 B 数量
											</FormLabel>
											<FormControl>
												<Input
													value={numberValue}
													onChange={(event) =>
														onChange?.(Number(event.target.value))
													}
													onBlur={onBlur}
													type="number"
													step="any"
													placeholder="0.00"
													aria-invalid={Boolean(error)}
													className="w-full border-0 bg-transparent text-white shadow-none outline-none placeholder:text-slate-400"
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							</FormField>
						</div>
					</Form>
				</DialogContent>
				<DialogActions>
					<Button
						type="button"
						variant="text"
						sx={{ color: '#d4d4d8' }}
						onClick={() => setOpen(false)}
					>
						{t('swap.cancel')}
					</Button>
					<Button
						type="button"
						variant="contained"
						sx={{
							background: 'linear-gradient(135deg,#b29bff,#8a7bff_35%,#4a5df7)',
							fontWeight: 700,
							color: '#fff',
						}}
						onClick={() => void handleSubmit()}
						disabled={isPending}
					>
						{isPending ? '提交中...' : t('swap.confirm')}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
