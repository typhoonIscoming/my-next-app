import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="skeleton"
			className={cn(
				'relative overflow-hidden rounded-md bg-muted/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_ease-in-out_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/45 before:via-white/75 before:to-transparent before:opacity-100',
				className
			)}
			{...props}
		/>
	);
}

export { Skeleton };
