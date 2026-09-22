'use client';
import { createContext } from 'react';
import type { Token } from './types';

interface LiquidityContextType {
	poolExists: boolean;
	isCheckingPool: boolean;
	currentPool: string | null;

	fee: number | null;
	token0: Token | null;
	token1: Token | null;
	chainId: number | null;
	setOtherValues: (otherValues: Partial<LiquidityContextType>) => void;
}

export const initialLiquidity = {
	poolExists: false,
	isCheckingPool: false,
	currentPool: null,

	fee: null,
	token0: null,
	token1: null,
	chainId: null,
};

export default createContext<LiquidityContextType>({
	...initialLiquidity,
	setOtherValues: () => {},
});
