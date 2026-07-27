// types/index.ts
import { ethers } from 'ethers';

export interface ContractConfig {
	address: string;
	abi: any[];
}

export interface TransactionState {
	isLoading: boolean;
	hash?: string;
	receipt?: ethers.TransactionReceipt;
	error?: Error;
}

export interface WalletState {
	isConnected: boolean;
	address?: string;
	chainId?: number;
	balance?: string;
	provider?: ethers.BrowserProvider;
	signer?: ethers.Signer;
}
