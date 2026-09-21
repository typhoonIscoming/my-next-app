import * as React from 'react';
import { X } from 'lucide-react';

import { cn } from '@/lib/utils';

type InputProps = React.ComponentProps<'input'> & {
	onValueChange?: (value: string) => void;
	allowClear?: boolean;
	onClear?: () => void;
};

function Input({
	className,
	type,
	onChange,
	onValueChange,
	allowClear = false,
	onClear,
	value,
	defaultValue,
	...props
}: InputProps) {
	const inputRef = React.useRef<HTMLInputElement | null>(null);

	const hasValue =
		value !== undefined && value !== null && String(value).length > 0
			? true
			: defaultValue !== undefined &&
				defaultValue !== null &&
				String(defaultValue).length > 0;

	const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
		onChange?.(event);
		onValueChange?.(event.target.value);
	};

	const handleClear = () => {
		if (inputRef.current) {
			inputRef.current.value = '';
			const clearedEvent = {
				target: { ...inputRef.current, value: '' },
				currentTarget: { ...inputRef.current, value: '' },
			} as React.ChangeEvent<HTMLInputElement>;
			onChange?.(clearedEvent);
			onValueChange?.('');
		}
		onClear?.();
	};

	return (
		<div className="relative w-full flex items-center">
			<input
				ref={inputRef}
				type={type}
				data-slot="input"
				value={value}
				defaultValue={defaultValue}
				className={cn(
					'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
					allowClear && 'pr-8',
					className
				)}
				onChange={handleChange}
				{...props}
			/>
			{allowClear && hasValue && (
				<button
					type="button"
					aria-label="Clear input"
					onClick={handleClear}
					className="absolute cursor-pointer right-2 top-1/2 inline-flex h-4 leading-4 w-4 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				>
					<X className="h-4 w-4" />
				</button>
			)}
		</div>
	);
}

export { Input };
