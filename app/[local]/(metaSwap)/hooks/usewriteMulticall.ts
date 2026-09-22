import { useCallback } from 'react';
import useWriteContractEstimatedGas from './useWriteContractEstimatedGas';

const SELF_PERMIT_IF_NECESSARY_SELECTOR = '0xc2e3140a';

export function isSelfPermitIfNecessaryCalldata(calldata: `0x${string}`) {
	return calldata.slice(0, 10).toLowerCase() === SELF_PERMIT_IF_NECESSARY_SELECTOR;
}

export default function useWriteMulticall() {
	const { estimateGas: writeContractWithEstimatedGas } = useWriteContractEstimatedGas();
	return useCallback(
		async ({
			calldatas,
			contractAddress,
			abi,
			args,
		}: {
			calldatas: `0x${string}`[];
			contractAddress: `0x${string}`;
			abi: any;
			args: any[];
		}) => {
			try {
				await writeContractWithEstimatedGas({
					address: contractAddress,
					abi,
					functionName: 'multicall',
					args,
				});
			} catch (error) {
				// permit 失败时尝试降级为不带 permit 的 multicall，避免整包失败
				const hasPermitCall = calldatas.some(isSelfPermitIfNecessaryCalldata);
				if (!hasPermitCall) throw error;

				const fallbackCalldatas = calldatas.filter(
					(data) => !isSelfPermitIfNecessaryCalldata(data)
				);
				if (fallbackCalldatas.length === 0) throw error;

				console.warn('Permit multicall 失败，回退为不带 permit 的调用重试');
				await writeContractWithEstimatedGas({
					address: contractAddress,
					abi,
					functionName: 'multicall',
					args: [fallbackCalldatas],
				});
			}
		},
		[writeContractWithEstimatedGas]
	);
}
