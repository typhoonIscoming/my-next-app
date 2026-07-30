import { Skeleton } from '@/components/ui/skeleton';

export default function SkeletonCom() {
	return (
		<div className="p-4">
			<div className="animate-pulse">
				<Skeleton className="h-10 bg-gray-200 rounded w-32 mb-4" />
				<div className="space-y-3">
					<Skeleton className="h-20 bg-gray-100 rounded" />
					<Skeleton className="h-20 bg-gray-100 rounded" />
				</div>
			</div>
		</div>
	);
}
