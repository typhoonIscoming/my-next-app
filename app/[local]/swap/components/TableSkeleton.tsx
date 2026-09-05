import useIsMobile from '@/hooks/useIsMobile';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function TableSkeleton() {
	const isMobile = useIsMobile();
	return (
		<div
			className="relative w-full mt-2"
			role="status"
			aria-live="polite"
			aria-label="Loading pools"
		>
			<div className="space-y-3">
				{Array.from({ length: 20 }).map((_, index) => (
					<div key={index} className="flex items-center">
						<Skeleton className="shrink-0 rounded-none! h-10 w-12 bg-white/8" />
						<Skeleton
							className={cn(
								'shrink-0 rounded-none! h-10 w-56 bg-white/8',
								isMobile ? 'w-40' : 'w-60'
							)}
						/>
						<Skeleton className="shrink-0 rounded-none! h-10 w-40 bg-white/8" />
						<Skeleton className="shrink-0 grow rounded-none! h-10 w-40 bg-white/8" />
						<Skeleton className="shrink-0 rounded-none! h-10 w-40 bg-white/8" />
						<Skeleton className="shrink-0 rounded-none! h-10 w-40 bg-white/8" />
					</div>
				))}
			</div>
		</div>
	);
}
