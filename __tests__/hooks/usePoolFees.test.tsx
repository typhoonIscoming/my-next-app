import { renderHook } from '@testing-library/react';
import { usePoolFees } from '@/app/[local]/swap/hooks/usePoolFees';
import { useReadPool } from '@/app/[local]/swap/hooks/useReadPool';

jest.mock('@/app/[local]/swap/hooks/useReadPool', () => ({
	useReadPool: jest.fn(),
}));

describe('usePoolFees', () => {
	it('returns unique fee options for the selected token pair', () => {
		(jest.mocked(useReadPool) as jest.Mock).mockReturnValue({
			data: [
				{ token0: '0x1111', token1: '0x2222', fee: 100n },
				{ token0: '0x2222', token1: '0x1111', fee: 500n },
				{ token0: '0x3333', token1: '0x4444', fee: 300n },
			],
		});

		const { result } = renderHook(() => usePoolFees('0x1111', '0x2222'));

		expect(result.current.fees).toEqual([0.01, 0.05]);
	});
});
