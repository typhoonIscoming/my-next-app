export type TransactionStatus = 'pending' | 'confirmed' | 'success';

export type TransactionAction =
	'approve0' | 'approve1' | 'wrap0' | 'wrap1' | 'createPool' | 'addLiquidity';

export type TransactionStatusProps = {
	status: TransactionStatus;
	action: TransactionAction;
	hash: string;
};

export type Step = 'select' | 'searching' | 'found' | 'notFound' | 'addLiquidity';

export type Token = {
	address: string;
	symbol: string;
	name: string;
	decimals: number;
};

export interface TokenSelectorProps {
	selectedToken: Token | null;
	tokenList: Token[];
	onSelect: (token: Token) => void;
	label: string;
	otherToken: Token | null;
}
