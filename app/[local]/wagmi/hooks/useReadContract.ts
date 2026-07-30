import { useReadContract, useAccount, useChainId, useBalance } from 'wagmi';
import { erc20Abi } from 'viem';
import { abi } from './abi';
import { config } from './config';
import { sepoliaContractAddress } from '@/lib/utils';

export const useReadContractLocal = () => {
	const { address: connectedAddress } = useAccount();
	const result = useReadContract({
		abi: erc20Abi,
		address: sepoliaContractAddress,
		functionName: 'totalSupply',
	});
	const { data } = useReadContract({
		abi: erc20Abi,
		address: sepoliaContractAddress,
		functionName: 'balanceOf',
		args: [connectedAddress as `0x${string}`],
	});
	const { data: name } = useReadContract({
		address: sepoliaContractAddress,
		abi: erc20Abi, // 使用 viem 内置的标准 ERC-20 ABI
		functionName: 'name',
	});
	const { data: symbol } = useReadContract({
		address: sepoliaContractAddress,
		abi: erc20Abi,
		functionName: 'symbol',
	});
	const { data: decimals } = useReadContract({
		address: sepoliaContractAddress,
		abi: erc20Abi,
		functionName: 'decimals',
	});
	return {
		result,
		balance: data,
		name,
		symbol,
		decimals,
	};
};
