import { useCallback } from 'react';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { ContractWriteParams } from '../liquidity/types';
import { GAS_LIMIT_CAP } from '@/lib/utils';

export default function useWriteContractEstimatedGas() {
	const { address } = useAccount();
	const publicClient = usePublicClient();
	const { writeContract, data: hash, isPending } = useWriteContract();
	const estimateGas = useCallback(
		async ({
			address: contractAddress,
			abi,
			functionName,
			args,
			value,
		}: ContractWriteParams) => {
			if (!address) {
				throw new Error('钱包未连接');
			}
			if (!publicClient) {
				throw new Error('Public client not available');
			}
			const estimatedGas = await publicClient.estimateContractGas({
				account: address,
				address: contractAddress,
				abi,
				functionName,
				args,
				value,
			} as never);

			const gas = (estimatedGas * 12n) / 10n;
			writeContract({
				account: address,
				address: contractAddress,
				abi,
				functionName,
				args,
				value,
				gas: gas > GAS_LIMIT_CAP ? GAS_LIMIT_CAP : gas,
			} as never);
		},
		[address, publicClient]
	);
	return {
		estimateGas,
		hash,
		isPending,
	};
}
