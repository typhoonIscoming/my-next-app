import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@mui/material/Button';

import type { TokenSelectorProps } from './types';

export default function TokenSelector({
	selectedToken,
	tokenList,
	onSelect,
	label,
	otherToken,
}: TokenSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (!containerRef.current) return;
			if (!containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	return (
		<div className="relative" ref={containerRef}>
			<Button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-lg transition-colors max-w-full"
			>
				<div className="w-6 h-6 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
					<span className="text-white text-xs font-bold">{selectedToken?.symbol[0]}</span>
				</div>
				<span className="font-medium">{selectedToken?.symbol}</span>
				<ChevronDown className="w-4 h-4" />
			</Button>

			{isOpen && (
				<div className="absolute top-full right-0 mt-1 w-48 max-w-[calc(100vw-2rem)] bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
					<div className="p-2 max-h-[60vh] overflow-y-auto">
						<div className="text-sm text-muted-foreground px-2 py-1">{label}</div>
						{tokenList.map((token) => (
							<button
								key={token.address}
								onClick={() => {
									onSelect(token);
									setIsOpen(false);
								}}
								disabled={!!(otherToken && token.address === otherToken.address)}
								className={cn(
									'w-full flex items-center space-x-3 px-2 py-2 rounded transition-colors',
									selectedToken &&
										selectedToken.address === token.address &&
										'bg-accent',
									otherToken && token.address === otherToken.address
										? 'opacity-50 cursor-not-allowed'
										: 'hover:bg-accent'
								)}
							>
								<div className="w-6 h-6 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
									<span className="text-white text-xs font-bold">
										{token.symbol[0]}
									</span>
								</div>
								<div className="text-left">
									<div className="font-medium text-foreground">
										{token.symbol}
									</div>
									<div className="text-sm text-muted-foreground">
										{token.name}
									</div>
								</div>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
