import { createContext } from 'react';

export type SwapContextValue = {
	isCreatePoolOpen: boolean;
	openCreatePool: () => void;
	closeCreatePool: () => void;
};

export const SwapContext = createContext<SwapContextValue>({
	isCreatePoolOpen: false,
	openCreatePool: () => {},
	closeCreatePool: () => {},
});
