import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PositionList from '../../app/[local]/swap/position/PositionList';
import { useReadPositions } from '../../app/[local]/swap/hooks/useReadPositions';
import { useAccount, useWriteContract } from 'wagmi';

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}));

jest.mock('@/hooks/useIsMobile', () => ({
	__esModule: true,
	default: () => false,
}));

jest.mock('@/app/[local]/swap/hooks/useReadPositions', () => ({
	useReadPositions: jest.fn(),
}));

jest.mock('wagmi', () => ({
	useAccount: jest.fn(),
	useWriteContract: jest.fn(),
}));

describe('PositionList', () => {
	beforeEach(() => {
		(jest.mocked(useAccount) as jest.Mock).mockReturnValue({
			address: undefined,
		});
		(jest.mocked(useWriteContract) as jest.Mock).mockReturnValue({
			writeContractAsync: jest.fn().mockResolvedValue('0xabc'),
			isPending: false,
		});
	});

	it('shows skeleton while position data is loading', () => {
		(useReadPositions as jest.Mock).mockReturnValue({
			isLoading: true,
			data: undefined,
			error: null,
		});

		render(<PositionList />);

		expect(screen.getByRole('status')).toBeInTheDocument();
		expect(screen.queryByText('swap.emptyList')).not.toBeInTheDocument();
	});

	it('renders collect button for the current owner and triggers contract call', async () => {
		(useReadPositions as jest.Mock).mockReturnValue({
			isLoading: false,
			data: [
				{
					id: 1n,
					owner: '0x1234567890123456789012345678901234567890',
					token0: '0x1111111111111111111111111111111111111111',
					token1: '0x2222222222222222222222222222222222222222',
					fee: 10000n,
					tickLower: -100n,
					tickUpper: 100n,
					liquidity: 1000000000000000000n,
				},
			],
			refetch: jest.fn(),
		});

		const writeContractAsync = jest.fn().mockResolvedValue('0xabc');
		(jest.mocked(useAccount) as jest.Mock).mockReturnValue({
			address: '0x1234567890123456789012345678901234567890',
		} as any);
		(jest.mocked(useWriteContract) as jest.Mock).mockReturnValue({
			writeContractAsync,
			isPending: false,
		});

		render(<PositionList />);

		const collectButton = screen.getByRole('button', { name: 'swap.collect' });
		expect(collectButton).toBeInTheDocument();

		await userEvent.click(collectButton);

		expect(writeContractAsync).toHaveBeenCalledWith(
			expect.objectContaining({
				functionName: 'collect',
				args: [1n, '0x1234567890123456789012345678901234567890'],
			})
		);
	});
});
