import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import TokenSelector from './tokenSelector';
import { tokens } from '@/lib/utils';
import type { Token } from './types';

export default function SelectStep() {
	const t = useTranslations();
	const [selectedToken0Address, setSelectedToken0Address] = useState('');
	const [token0, setToken0] = useState<Token | null>(null);
	const [token1, setToken1] = useState<Token | null>(null);
	const tokenList = Object.values(tokens);

	return (
		<div className="select-step-container text-gray-600">
			<p>{t('swap.selectPair')}</p>
			<div className="mb-4">
				<label className="block text-sm font-medium text-muted-foreground mb-2">
					代币 0 地址
				</label>
				<div className="flex space-x-2">
					<Input
						type="text"
						value={selectedToken0Address}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setSelectedToken0Address(e.target.value)
						}
						placeholder="0x..."
						className="flex-1"
					/>
					<TokenSelector
						selectedToken={token0 || tokenList[0]}
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
		</div>
	);
}
