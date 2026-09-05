'use client';

import { ReactNode, useCallback, useMemo, useState } from 'react';
import { SwapContext } from '../context/swapContext';

export function SwapProvider({ children }: { children: ReactNode }) {
	const [isCreatePoolOpen, setIsCreatePoolOpen] = useState(false);

	const openCreatePool = useCallback(() => setIsCreatePoolOpen(true), []);
	const closeCreatePool = useCallback(() => setIsCreatePoolOpen(false), []);

	const value = useMemo(
		() => ({
			isCreatePoolOpen,
			openCreatePool,
			closeCreatePool,
		}),
		[closeCreatePool, isCreatePoolOpen, openCreatePool]
	);

	return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>;
}
