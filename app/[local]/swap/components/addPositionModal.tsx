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
import { formatUnits } from 'viem';
import Box from '@mui/material/Box';
import useBalance from '../../wagmi/hooks/useAccount';
import { tokenList } from '@/lib/utils';

const pairOptions = ['ETH / USDC', 'BTC / USDC', 'SOL / USDT', 'ARB / ETH'];

const addPositionSchema = (maxEthAmount: number) =>
	z
		.object({
			ethAmount: z.coerce
				.number({ invalid_type_error: '请输入有效数量' })
				.positive('数量必须大于 0')
				.max(maxEthAmount, `ETH数量不能超过可用余额 ${maxEthAmount}`),
			pair: z.string().min(1, '请选择交易对'),
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
			pair: tokenList[0].address,
			amount: 0,
			minPrice: 0,
			maxPrice: 0,
			fee: 0,
			currentPrice: 0,
		},
	});

	const handleSubmit = (values: AddPositionFormValues) => {
		toast.success('添加成功');
		onSubmit?.(values);
	};

	useImperativeHandle(
		ref,
		() => ({
			submit: () => {
				void form.handleSubmit(handleSubmit)();
			},
			reset: () => form.reset(),
			trigger: () => form.trigger(),
			getValues: () => form.getValues(),
		}),
		[form, handleSubmit]
	);

	return (
		<Form form={form} onSubmit={handleSubmit}>
			<FormField control={form.control} name="ethAmount">
				{({ value, onChange, onBlur, error }) => {
					const numberValue = typeof value === 'number' ? value : value === '' ? 0 : 0;
					const ratioOptions = [0.25, 0.5, 0.75, 1];

					return (
						<FormItem className="group rounded-xl border border-white/10 bg-[#0d1727] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
							<FormLabel className="text-slate-200">ETH数量</FormLabel>
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
							<Box className="text-slate-400 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
								<span className="text-sm">可用余额: {formattedBalance} ETH</span>
								<Box className="hidden overflow-hidden md:flex gap-2">
									{ratioOptions.map((fraction, index) => (
										<div
											key={fraction}
											onClick={() => {
												// 取两位小数
												const v = Number(
													(Number(formattedBalance) * fraction).toFixed(2)
												);
												onChange?.(v);
											}}
											className="hidden cursor-pointer text-sm bg-white/10 px-2 rounded-full md:flex gap-2 opacity-0 translate-y-[-20px] transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0"
											style={{
												['--d' as any]: `${0.05 * index}s`,
												transitionDelay: `var(--d)`,
											}}
										>
											{fraction * 100}%
										</div>
									))}
								</Box>
							</Box>
							<FormMessage />
						</FormItem>
					);
				}}
			</FormField>
			<FormField control={form.control} name="pair">
				{({ value, onChange, onBlur, error }) => {
					const pairValue = typeof value === 'string' ? value : '';

					return (
						<FormItem className="rounded-xl border border-white/10 bg-[#0d1727] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
							<FormLabel className="text-slate-200">交易对</FormLabel>
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
