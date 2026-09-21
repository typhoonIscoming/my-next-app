import { useTranslations } from 'next-intl';
import { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import TokenSelector from './tokenSelector';
import { tokens, feeTiers, cn } from '@/lib/utils';
import type { Token } from './types';
import { useChainId, useChains } from 'wagmi';
import { AlertCircle } from 'lucide-react';

interface SelectStepProps {
	setStep: (step: string) => void;
}
export default function SelectStep({ setStep }: SelectStepProps) {
	const t = useTranslations();
	const chainId = useChainId();
	const selectedChainId = chainId || 11155111;
	const chains = useChains();
	const [selectedToken0Address, setSelectedToken0Address] = useState('');
	const [token0, setToken0] = useState<Token | null>(null);
	const [selectedToken1Address, setSelectedToken1Address] = useState('');
	const [token1, setToken1] = useState<Token | null>(null);
	const [selectedFee, setSelectedFee] = useState(3000);
	const [searchError, setSearchError] = useState<string | null>(null);
	const [isCheckingPool, setIsCheckingPool] = useState(false);
	const [transactionError, setTransactionError] = useState<string | null>(null);
	const [poolExists, setPoolExists] = useState(false);
	const [currentPool, setCurrentPool] = useState<string | null>(null);
	const [poolIndex, setPoolIndex] = useState<number | null>(null);

	const tokenList = Object.values(tokens);

	const chainName = useMemo(() => {
		const chain = chains.find((c) => c.id === selectedChainId);
		return chain ? chain.name : 'Unknown';
	}, [chainId, chains]);

	const fetchPoolStatus = useCallback(async () => {
		const response = await fetch('/api/pools/check', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token0: selectedToken0Address,
				token1: selectedToken1Address,
				fee: selectedFee,
			}),
		}).then((res) => res.json());

		if (!response.success) {
			throw new Error(response.error || '搜索池子失败');
		}

		return response;
	}, [selectedToken0Address, selectedToken1Address, selectedFee]);

	const applyPoolStatus = useCallback(
		(response: { exists: boolean; poolAddress?: string; poolIndex?: number }) => {
			if (response.exists) {
				setPoolExists(true);
				setCurrentPool(response.poolAddress || null);
				setPoolIndex(response.poolIndex ?? null);
				return;
			}

			setPoolExists(false);
			setCurrentPool(null);
			setPoolIndex(null);
		},
		[]
	);
	// 搜索池子
	const searchPool = useCallback(async () => {
		if (!selectedToken0Address || !selectedToken1Address) {
			setSearchError(t('swap.selectTwoAddress'));
			return;
		}

		if (selectedToken0Address.toLowerCase() === selectedToken1Address.toLowerCase()) {
			setSearchError(t('swap.selectTwoAddress', { type: t('swap.different') }));
			return;
		}

		setStep('searching');
		setIsCheckingPool(true);
		setSearchError(null);
		setTransactionError(null);

		try {
			const response = await fetchPoolStatus();
			applyPoolStatus(response);
			setStep(response.exists ? 'found' : 'notFound');
		} catch (error) {
			console.error('搜索池子失败:', error);
			setSearchError(error instanceof Error ? error.message : '搜索池子失败');
			setPoolExists(false);
			setCurrentPool(null);
			setPoolIndex(null);
			setStep('notFound');
		} finally {
			setIsCheckingPool(false);
		}
	}, [selectedToken0Address, selectedToken1Address, fetchPoolStatus, applyPoolStatus]);

	const refreshPoolStatus = useCallback(async () => {
		if (!selectedToken0Address || !selectedToken1Address) return;

		setIsCheckingPool(true);
		try {
			const response = await fetchPoolStatus();
			applyPoolStatus(response);
		} catch (error) {
			console.error('刷新池子状态失败:', error);
		} finally {
			setIsCheckingPool(false);
		}
	}, [selectedToken0Address, selectedToken1Address, fetchPoolStatus, applyPoolStatus]);

	return (
		<div className="select-step-container text-gray-600">
			<h3 className="mb-4">{t('swap.selectPair')}</h3>
			<div className="mb-4">
				<label className="block text-sm font-medium text-muted-foreground mb-2">
					{t('swap.tokenAddress', { pair: '0' })}
				</label>
				<div className="flex items-center space-x-2">
					<Input
						type="text"
						allowClear
						readOnly
						value={selectedToken0Address}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setSelectedToken0Address(e.target.value);
							setToken0(null);
						}}
						placeholder="0x..."
						className="flex-1 border h-10 disabled:text-black font-bold border-gray-300 rounded-lg focus-visible:shadow-blue-400 focus:outline-none"
					/>
					<TokenSelector
						selectedToken={token0}
						tokenList={tokenList}
						onSelect={(token) => {
							setSelectedToken0Address(token.address);
							setToken0(token);
						}}
						label="快速选择"
						otherToken={token1 || tokenList[1]}
					/>
				</div>
			</div>
			<div className="mb-4">
				<label className="block text-sm font-medium text-muted-foreground mb-2">
					{t('swap.tokenAddress', { pair: '1' })}
				</label>
				<div className="flex items-center space-x-2">
					<Input
						type="text"
						allowClear
						readOnly
						value={selectedToken1Address}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setSelectedToken1Address(e.target.value);
							setToken1(null);
						}}
						placeholder="0x..."
						className="flex-1 border h-10 disabled:text-black font-bold border-gray-300 rounded-lg focus-visible:shadow-blue-400 focus:outline-none"
					/>
					<TokenSelector
						selectedToken={token1}
						tokenList={tokenList}
						onSelect={(token) => {
							setSelectedToken1Address(token.address);
							setToken1(token);
						}}
						label="快速选择"
						otherToken={token1 || tokenList[1]}
					/>
				</div>
			</div>
			<div className="mb-4">
				<label className="block text-sm font-medium text-muted-foreground mb-2">
					{t('swap.feeRate')}
				</label>
				<div className="flex space-x-2">
					{feeTiers.map((feeValue) => (
						<button
							key={feeValue}
							onClick={() => setSelectedFee(feeValue)}
							className={cn(
								'px-3 py-2 bg-emerald-300 cursor-pointer rounded text-sm transition-colors flex-1',
								selectedFee === feeValue
									? 'bg-primary text-primary-foreground'
									: 'bg-(--muted-primary)'
							)}
						>
							{feeValue / 10000}%
						</button>
					))}
				</div>
			</div>
			<div className="mb-6">
				<label className="block text-sm font-medium text-muted-foreground mb-2">
					{t('swap.chain')}
				</label>
				<input
					type="number"
					readOnly
					value={selectedChainId}
					className="w-full px-3 py-2 bg-(--muted-primary) border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
				/>
				<div className="mt-1 text-xs text-muted-foreground">
					{t('swap.current')}: {chainName} ({selectedChainId})
				</div>
			</div>
			{searchError && (
				<div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
					<div className="flex items-center">
						<AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mr-2" />
						<span className="text-sm text-red-600 dark:text-red-400">
							{searchError}
						</span>
					</div>
				</div>
			)}
			<button
				onClick={searchPool}
				disabled={!selectedToken0Address || !selectedToken1Address || isCheckingPool}
				className={cn(
					'w-full py-4 rounded-lg font-medium text-lg transition-colors',
					!selectedToken0Address || !selectedToken1Address || isCheckingPool
						? 'bg-muted text-muted-foreground cursor-not-allowed'
						: 'bg-primary hover:bg-primary/90 text-primary-foreground'
				)}
			>
				{isCheckingPool ? `${t('swap.searching')}...` : `${t('swap.searchPool')}`}
			</button>
		</div>
	);
}
