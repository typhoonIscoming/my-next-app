// hooks/viem/useClients.ts
import { createContext, useContext, ReactNode } from 'react';
import { createPublicClient, createWalletClient, http, custom } from 'viem';

export const ClientsContext = createContext<{
	publicClient: ReturnType<typeof createPublicClient>;
	walletClient: ReturnType<typeof createWalletClient>;
} | null>(null);

export const useClients = () => {
	const context = useContext(ClientsContext);
	if (!context) {
		throw new Error('useClients must be used within ClientsProvider');
	}
	return context;
};
