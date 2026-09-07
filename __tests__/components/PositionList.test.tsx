import { render, screen } from '@testing-library/react';
import PositionList from '../../app/[local]/swap/position/PositionList';
import { useReadPositions } from '../../app/[local]/swap/hooks/useReadPositions';

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

describe('PositionList', () => {
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
});
