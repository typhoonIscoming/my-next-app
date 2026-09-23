import { useContext } from 'react';
import liquidityContext from './context';
import { formatAddress } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import type { Step } from './types';

export default function FoundPair({ onSetStep }: { onSetStep: (action: Step) => void }) {
	const { currentPool, fee, poolIndex } = useContext(liquidityContext);

	const useFoundPool = () => {
		onSetStep('addLiquidity');
	};
	const createNewPool = () => {
		onSetStep('addLiquidity');
	};
	return (
		<div>
			<div className="mb-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold text-gray-600">找到可复用的池子</h3>
				</div>

				<div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg mb-4">
					<div className="flex items-center mb-2">
						<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
						<span className="font-medium text-green-800">池子已存在</span>
					</div>
					<div className="text-sm text-green-700 space-y-1">
						<div>池子地址: {currentPool ? formatAddress(currentPool) : 'N/A'}</div>
						<div>费率: {(fee as number) / 10000}%</div>
						{poolIndex !== null && <div>池子索引: {poolIndex}</div>}
					</div>
				</div>

				<div className="flex space-x-3">
					<button
						onClick={useFoundPool}
						className="flex-1 cursor-pointer py-3 rounded-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
					>
						使用此池子
					</button>
					<button
						onClick={createNewPool}
						className="flex-1 cursor-pointer py-3 rounded-lg font-medium bg-muted hover:bg-accent text-foreground transition-colors"
					>
						创建新池子
					</button>
				</div>
			</div>
		</div>
	);
}
