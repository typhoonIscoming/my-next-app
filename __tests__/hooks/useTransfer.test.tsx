import { act, renderHook } from '@testing-library/react';
import { parseUnits } from 'viem';
import { stakeAbi } from '@/app/[local]/(stake)/stake/hook/abi';
import useTransfer from '@/app/[local]/(stake)/stake/hook/useTransfer';
import { stakeContractAddress } from '@/lib/utils';

const mockWriteContract = jest.fn();

jest.mock('wagmi', () => ({
	useAccount: () => ({
		address: '0x1111111111111111111111111111111111111111',
	}),
	usePublicClient: () => ({
		estimateContractGas: jest.fn().mockResolvedValue(200000n),
	}),
	useWriteContract: () => ({
		writeContract: mockWriteContract,
		data: undefined,
		error: null,
		isPending: false,
		status: 'idle',
	}),
	useWaitForTransactionReceipt: () => ({
		data: undefined,
		isLoading: false,
		isSuccess: false,
		status: 'idle',
	}),
}));

describe('useTransfer', () => {
	beforeEach(() => {
		mockWriteContract.mockReset();
		mockWriteContract.mockImplementation((config: any, options?: any) => {
			options?.onSuccess?.('0xabc');
			return '0xabc';
		});
	});

	it('calls depositETH with ETH value at the top level and no args', async () => {
		const { result } = renderHook(() => useTransfer());

		await act(async () => {
			await result.current.transfer({
				to: '0x1234567890123456789012345678901234567890' as `0x${string}`,
				amount: '1.5',
			});
		});

		expect(mockWriteContract).toHaveBeenCalledWith(
			{
				address: stakeContractAddress,
				abi: stakeAbi,
				functionName: 'depositETH',
				value: parseUnits('1.5', 18),
				gas: 200000n,
			},
			expect.objectContaining({
				onSuccess: expect.any(Function),
			})
		);
	});
});
