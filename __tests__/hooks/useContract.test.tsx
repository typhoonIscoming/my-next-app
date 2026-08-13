import { act, renderHook } from '@testing-library/react';
import { parseUnits } from 'viem';
import { useUnstake } from '@/app/[local]/(stake)/stake/hook/useContract';
import { stakeAbi } from '@/app/[local]/(stake)/stake/hook/abi';
import { stakeContractAddress } from '@/lib/utils';

const mockWriteContract = jest.fn();

jest.mock('wagmi', () => ({
	useAccount: () => ({
		address: '0x1111111111111111111111111111111111111111',
	}),
	useChainId: () => 1,
	useReadContracts: () => ({
		data: undefined,
		isLoading: false,
		isFetching: false,
		isError: false,
		error: null,
		refetch: jest.fn(),
	}),
	useWriteContract: () => ({
		writeContract: mockWriteContract,
		data: undefined,
		error: null,
		isPending: false,
		status: 'idle',
		reset: jest.fn(),
	}),
}));

describe('useUnstake', () => {
	beforeEach(() => {
		mockWriteContract.mockReset();
		mockWriteContract.mockImplementation((config: any, options?: any) => {
			options?.onSuccess?.('0xunstake');
			return '0xunstake';
		});
	});

	it('unstakes the user-provided amount through the contract', async () => {
		const { result } = renderHook(() => useUnstake());

		await act(async () => {
			await result.current.unstake('1.5');
		});

		expect(mockWriteContract).toHaveBeenCalledWith(
			{
				address: stakeContractAddress,
				abi: stakeAbi,
				functionName: 'unstake',
				chainId: 1,
				args: [0n, parseUnits('1.5', 18)],
			},
			expect.objectContaining({
				onSuccess: expect.any(Function),
			})
		);
	});
});
