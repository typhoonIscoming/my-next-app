import { fireEvent, render, screen } from '@testing-library/react';
import { AddPositionForm } from '../../app/[local]/swap/components/addPositionModal';
import { Input } from '../../components/ui/input';

jest.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}));

describe('AddPositionForm', () => {
	it('allows typing into number fields', () => {
		render(<AddPositionForm />);

		const amountInput = screen.getAllByPlaceholderText('0.00')[0];
		fireEvent.change(amountInput, { target: { value: '12.5' } });

		expect(amountInput).toHaveValue(12.5);
	});

	it('emits onValueChange from Input when its value changes', () => {
		const onValueChange = jest.fn();
		render(<Input aria-label="amount" onValueChange={onValueChange} />);

		fireEvent.change(screen.getByLabelText('amount'), { target: { value: '42' } });

		expect(onValueChange).toHaveBeenCalledWith('42');
	});

	it('allows selecting a trading pair', () => {
		render(<AddPositionForm />);

		const trigger = screen.getByRole('combobox');
		fireEvent.click(trigger);
		fireEvent.click(screen.getByRole('option', { name: 'BTC / USDC' }));

		expect(trigger).toHaveTextContent('BTC / USDC');
	});
});
