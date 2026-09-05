import { render, screen } from '@testing-library/react';
import { PoolTable } from '../../app/[local]/swap/components/PoolTable';
import { useReadPool } from '../../app/[local]/swap/hooks/useReadPool';

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}));

jest.mock('@/hooks/useIsMobile', () => ({
	__esModule: true,
	default: () => false,
}));

jest.mock('@/app/[local]/swap/hooks/useReadPool', () => ({
	useReadPool: jest.fn(),
}));

describe('PoolTable', () => {
	it('shows skeleton while pool data is loading', () => {
		(useReadPool as jest.Mock).mockReturnValue({
			isLoading: true,
			data: undefined,
			error: null,
		});

		render(<PoolTable />);

		expect(screen.getByRole('status')).toBeInTheDocument();
		expect(screen.queryByText('swap.emptyList')).not.toBeInTheDocument();
	});
});
