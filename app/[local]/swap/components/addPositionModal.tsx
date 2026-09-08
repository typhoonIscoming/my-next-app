'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { formatUnits, type Address } from 'viem';
import Box from '@mui/material/Box';
import useBalance from '../../wagmi/hooks/useAccount';
import { tokenList } from '@/lib/utils';
import { useCreatePool } from '../hooks/useCreatePool';

const addPositionSchema = (maxEthAmount: number) =>
	z
		.object({
			ethAmount: z.coerce
				.number({ invalid_type_error: '请输入有效数量' })
				.positive('数量必须大于 0')
				.max(maxEthAmount, `ETH数量不能超过可用余额 ${maxEthAmount}`),
			pair: z
				.array(z.string().min(1, '请选择交易对'))
				.length(2, '请选择两个代币组成交易对')
				.refine((value) => value[0] !== value[1], {
					message: '交易对两个值不能相同',
				}),
			amount: z.coerce
				.number({ invalid_type_error: '请输入有效数量' })
				.positive('数量必须大于 0'),
			minPrice: z.coerce
				.number({ invalid_type_error: '请输入有效的最低价格' })
				.positive('最低价格必须大于 0'),
			maxPrice: z.coerce
				.number({ invalid_type_error: '请输入有效的最高价格' })
				.positive('最高价格必须大于 0'),
			fee: z.coerce
				.number({ invalid_type_error: '请输入有效的手续费' })
				.positive('手续费必须大于 0'),
			currentPrice: z.coerce
				.number({ invalid_type_error: '请输入有效的当前价格' })
				.positive('当前价格必须大于 0'),
		})
		.refine((data) => data.maxPrice > data.minPrice, {
			message: '最高价格必须大于最低价格',
			path: ['maxPrice'],
		});

type AddPositionFormValues = z.infer<ReturnType<typeof addPositionSchema>>;

export type AddPositionFormHandle = {
	submit: () => void;
	reset: () => void;
	trigger: () => Promise<boolean>;
	getValues: () => AddPositionFormValues;
};

export const AddPositionForm = forwardRef<
	AddPositionFormHandle,
	{
		onSubmit?: (values: AddPositionFormValues) => void;
		onCancel?: () => void;
	}
>(function AddPositionForm({ onSubmit, onCancel }, ref) {
	const { balance } = useBalance();
	const formattedBalance = Number(formatUnits(balance ?? 0, 18)).toFixed(2);
	const maxEthAmount = Number(formattedBalance || 0);
	const form = useForm<AddPositionFormValues>({
		resolver: zodResolver(addPositionSchema(maxEthAmount)),
		defaultValues: {
			ethAmount: 0,
			pair: [tokenList[0].address, tokenList[1].address],
			amount: 0,
			minPrice: 0,
			maxPrice: 0,
			fee: 0,
			currentPrice: 0,
		},
	});
	const { createAndInitializePoolIfNecessary, isPending } = useCreatePool();
	const setPairError = (message: string) => {
		form.setError('pair', {
			type: 'manual',
			message,
		});
	};

	const handleSubmit = async (values: AddPositionFormValues) => {
		if (values.pair[0] === values.pair[1]) {
			setPairError('交易对两个值不能相同');
			toast.error('交易对两个值不能相同');
			return;
		}
		form.clearErrors('pair');

		try {
			const feeValue = Number(values.fee || 0);
			const currentPriceValue = Number(values.currentPrice || 0);
			const tickLower = -887272n;
			const tickUpper = 887272n;
			const fee = BigInt(Math.max(0, Math.round(feeValue * 10000)));
			const sqrtPriceX96 =
				currentPriceValue > 0
					? BigInt(Math.floor(Math.sqrt(currentPriceValue) * Number(2n ** 96n)))
					: 2n ** 96n;
			const params = {
				token0: values.pair[0] as Address,
				token1: values.pair[1] as Address,
				fee,
				tickLower,
				tickUpper,
				sqrtPriceX96,
			};
			console.log('params', params);
			const result = await createAndInitializePoolIfNecessary(params);
			console.log('result', result);
			toast.success('添加成功');
			onSubmit?.(values);
		} catch (error) {
			console.error('create pool failed', error);
			toast.error('创建交易对失败，请检查参数或钱包余额');
		}
	};

	useImperativeHandle(
		ref,
		() => ({
			submit: async () => {
				console.log('123');
				const isValid = await form.trigger();
				console.log('isValid', isValid);
				if (!isValid) return;
				await handleSubmit(form.getValues());
			},
			reset: () => form.reset(),
			trigger: () => form.trigger(),
			getValues: () => form.getValues(),
		}),
		[form, handleSubmit]
	);

	return (
		<Form form={form} onSubmit={handleSubmit}>
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
										const nextPair = [nextValue, pairValue[1]].filter(Boolean);
										if (nextPair[0] === nextPair[1]) {
											setPairError('交易对两个值不能相同');
											toast.error('交易对两个值不能相同');
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
										const nextPair = [pairValue[0], nextValue].filter(Boolean);
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
									{[0.01, 0.05, 0.3, 1].map((item) => (
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
			<FormField control={form.control} name="amount">
				{({ value, onChange, onBlur, error }) => {
					const numberValue = typeof value === 'number' ? value : value === '' ? 0 : 0;

					return (
						<FormItem className="rounded-xl border border-white/10 bg-[#0d1727] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
							<FormLabel className="text-slate-200">数量</FormLabel>
							<FormControl>
								<Input
									value={numberValue}
									onChange={(event) => onChange?.(Number(event.target.value))}
									onBlur={onBlur}
									type="number"
									step="any"
									placeholder="0.00"
									aria-invalid={Boolean(error)}
									className="border-0 bg-transparent text-white shadow-none focus-visible:ring-0"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					);
				}}
			</FormField>
			<div className="grid gap-4 md:grid-cols-2">
				<FormField control={form.control} name="minPrice">
					{({ value, onChange, onBlur, error }) => {
						const numberValue =
							typeof value === 'number' ? value : value === '' ? 0 : 0;

						return (
							<FormItem className="rounded-xl border border-white/10 bg-[#0d1727] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
								<FormLabel className="text-slate-200">最低价</FormLabel>
								<FormControl>
									<Input
										value={numberValue}
										onChange={(event) => onChange?.(Number(event.target.value))}
										onBlur={onBlur}
										type="number"
										step="any"
										placeholder="0.00"
										aria-invalid={Boolean(error)}
										className="border-0 bg-transparent text-white shadow-none focus-visible:ring-0"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						);
					}}
				</FormField>
				<FormField control={form.control} name="maxPrice">
					{({ value, onChange, onBlur, error }) => {
						const numberValue =
							typeof value === 'number' ? value : value === '' ? 0 : 0;

						return (
							<FormItem className="rounded-xl border border-white/10 bg-[#0d1727] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
								<FormLabel className="text-slate-200">最高价</FormLabel>
								<FormControl>
									<Input
										value={numberValue}
										onChange={(event) => onChange?.(Number(event.target.value))}
										onBlur={onBlur}
										type="number"
										step="any"
										placeholder="0.00"
										aria-invalid={Boolean(error)}
										className="border-0 bg-transparent text-white shadow-none focus-visible:ring-0"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						);
					}}
				</FormField>
			</div>
			<FormField control={form.control} name="currentPrice">
				{({ value, onChange, onBlur, error }) => {
					const numberValue = typeof value === 'number' ? value : value === '' ? 0 : 0;

					return (
						<FormItem className="rounded-xl border border-white/10 bg-[#0d1727] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
							<FormLabel className="text-slate-200">当前价格</FormLabel>
							<FormControl>
								<Input
									value={numberValue}
									onChange={(event) => onChange?.(Number(event.target.value))}
									onBlur={onBlur}
									type="number"
									step="any"
									placeholder="0.00"
									aria-invalid={Boolean(error)}
									className="border-0 bg-transparent text-white shadow-none focus-visible:ring-0"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					);
				}}
			</FormField>
		</Form>
	);
});

export function AddPositionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
	const formRef = useRef<AddPositionFormHandle>(null);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ pb: 1, color: '#fff' }}>新增仓位</DialogTitle>
			<DialogContent sx={{ pt: 2, pb: 1 }}>
				<AddPositionForm
					ref={formRef}
					onCancel={onClose}
					onSubmit={(values) => {
						console.log('submit-values', values);
						onClose();
					}}
				/>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2 }}>
				<Button type="button" variant="text" onClick={onClose} sx={{ color: '#d4d4d8' }}>
					取消
				</Button>
				<Button
					type="button"
					variant="contained"
					onClick={() => formRef.current?.submit()}
					sx={{
						background: 'linear-gradient(135deg,#b29bff,#8a7bff_35%,#4a5df7)',
						fontWeight: 700,
						color: '#fff',
					}}
				>
					确认添加
				</Button>
			</DialogActions>
		</Dialog>
	);
}
