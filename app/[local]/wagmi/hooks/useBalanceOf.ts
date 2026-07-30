import { useReadContract, useAccount, useChainId, useBalance } from 'wagmi';
import { config } from './config';

export const useBalanceOf = () => {
	const { address } = useAccount();
	const chainId = useChainId({ config });
	const result = useBalance({
		address,
		chainId,
	});
	return result;
};
