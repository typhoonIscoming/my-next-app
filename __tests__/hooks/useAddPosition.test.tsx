import { act, renderHook } from '@testing-library/react';
import { postionsAbi } from '@/app/[local]/swap/hooks/abi';
import { useAddPosition } from '@/app/[local]/swap/hooks/useAddPosition';
import { positionsAddress } from '@/lib/utils';

const mockWriteContractAsync = jest.fn();
const mockReadContract = jest.fn();
const mockWaitForTransactionReceipt = jest.fn();

jest.mock('wagmi', () => ({
	useAccount: () => ({
		address: '0x1111111111111111111111111111111111111111',
	}),
	usePublicClient: () => ({
		readContract: mockReadContract,
		waitForTransactionReceipt: mockWaitForTransactionReceipt,
	}),
	useWriteContract: () => ({
		writeContractAsync: mockWriteContractAsync,
		isPending: false,
		error: null,
		status: 'idle',
		reset: jest.fn(),
		data: undefined,
	}),
}));

describe('useAddPosition', () => {
	beforeEach(() => {
		mockWriteContractAsync.mockReset();
		mockWriteContractAsync.mockResolvedValue('0xabc');
	});

	it('calls PositionManager.mint with sorted tokens and the expected MintParams', async () => {
		const address = '0x1111111111111111111111111111111111111111' as `0x${string}`;
		const tokenA = '0x2222222222222222222222222222222222222222' as `0x${string}`;
		const tokenB = '0x1111111111111111111111111111111111111111' as `0x${string}`;
		const deadline = 1_700_000_000n;

		mockReadContract.mockImplementation(async ({ functionName }) => {
			if (functionName === 'allowance') return 10_000n;
			if (functionName === 'balanceOf') return 20_000n;
			return 0n;
		});

		const { result } = renderHook(() => useAddPosition());

		await act(async () => {
			await result.current.addPosition({
				token0: tokenA,
				token1: tokenB,
				index: 0,
				amount0Desired: 1000n,
				amount1Desired: 2000n,
				recipient: address,
				deadline,
			});
		});

		expect(mockWriteContractAsync).toHaveBeenCalledWith(
			{
				address: positionsAddress,
				abi: postionsAbi,
				functionName: 'mint',
				args: [
					{
						token0: tokenB,
						token1: tokenA,
						index: 0,
						amount0Desired: 1000n,
						amount1Desired: 2000n,
						recipient: address,
						deadline,
					},
				],
				gas: expect.any(BigInt),
			},
			expect.any(Object)
		);
	});

	it('requests token approval before mint when allowance is insufficient', async () => {
		const address = '0x1111111111111111111111111111111111111111' as `0x${string}`;
		const tokenA = '0x2222222222222222222222222222222222222222' as `0x${string}`;
		const tokenB = '0x1111111111111111111111111111111111111111' as `0x${string}`;
		const deadline = 1_700_000_000n;

		mockReadContract.mockImplementation(async ({ functionName }) => {
			if (functionName === 'allowance') return 100n;
			if (functionName === 'balanceOf') return 10_000n;
			return 0n;
		});
		mockWriteContractAsync.mockResolvedValue('0xapproval');
		mockWaitForTransactionReceipt.mockResolvedValue({ status: 'success' });

		const { result } = renderHook(() => useAddPosition());

		await act(async () => {
			await result.current.addPosition({
				token0: tokenA,
				token1: tokenB,
				index: 0,
				amount0Desired: 1000n,
				amount1Desired: 2000n,
				recipient: address,
				deadline,
			});
		});

		expect(mockWriteContractAsync).toHaveBeenCalledWith(
			expect.objectContaining({
				address: tokenB,
				functionName: 'approve',
				args: [positionsAddress, expect.any(BigInt)],
			}),
			expect.any(Object)
		);
		expect(mockWriteContractAsync).toHaveBeenCalledWith(
			expect.objectContaining({
				address: tokenA,
				functionName: 'approve',
				args: [positionsAddress, expect.any(BigInt)],
			}),
			expect.any(Object)
		);
		expect(mockWriteContractAsync).toHaveBeenCalledTimes(3);
	});
});
