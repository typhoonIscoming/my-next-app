import { erc20Abi, type Address } from 'viem';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { positionsAddress } from '@/lib/utils';
import { postionsAbi } from './abi';

const MAX_RPC_GAS_LIMIT = 16_777_216n;
const MAX_UINT256 = 2n ** 256n - 1n;

export type AddPositionParams = {
	token0: Address;
	token1: Address;
	index: number;
	amount0Desired: bigint;
	amount1Desired: bigint;
	recipient?: Address;
	deadline: bigint;
};

export function useAddPosition() {
	const { address } = useAccount();
	const publicClient = usePublicClient();
	const { writeContractAsync, isPending, error, reset, status, data } = useWriteContract();

	const ensureTokenAllowance = async (owner: Address, token: Address, requiredAmount: bigint) => {
		if (!publicClient) {
			throw new Error('Public client is not available.');
		}

		const allowance = (await publicClient.readContract({
			address: token,
			abi: erc20Abi,
			functionName: 'allowance',
			args: [owner, positionsAddress],
		})) as bigint;

		if (allowance < requiredAmount) {
			await writeContractAsync({
				address: token,
				abi: erc20Abi,
				functionName: 'approve',
				args: [positionsAddress, MAX_UINT256],
			});
		}
	};

	const addPosition = async ({
		token0,
		token1,
		index,
		amount0Desired,
		amount1Desired,
		recipient,
		deadline,
	}: AddPositionParams) => {
		if (!positionsAddress) {
			throw new Error('PositionManager address is not configured.');
		}

		const finalRecipient = recipient ?? (address as Address);
		if (!finalRecipient) {
			throw new Error('Wallet not connected.');
		}

		const [sortedToken0, sortedToken1] = [token0, token1].sort((a, b) =>
			a.toLowerCase() < b.toLowerCase() ? -1 : 1
		) as Address[];

		await ensureTokenAllowance(finalRecipient, sortedToken0, amount0Desired);
		await ensureTokenAllowance(finalRecipient, sortedToken1, amount1Desired);

		return writeContractAsync(
			{
				address: positionsAddress,
				abi: postionsAbi,
				functionName: 'mint',
				args: [
					{
						token0: sortedToken0,
						token1: sortedToken1,
						index,
						amount0Desired,
						amount1Desired,
						recipient: finalRecipient,
						deadline,
					},
				],
				gas: MAX_RPC_GAS_LIMIT,
			},
			{
				onError: (error) => {
					if (
						String(error).includes('gas limit too high') ||
						String(error).includes('gas limit')
					) {
						throw new Error(
							'Gas limit exceeds the RPC cap. Please lower the transaction gas settings or retry with a smaller amount.'
						);
					}
					throw error;
				},
			}
		);
	};

	return {
		addPosition,
		isPending,
		error,
		status,
		hash: data,
		reset,
	};
}
