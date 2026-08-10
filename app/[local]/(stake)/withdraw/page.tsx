import Box from '@mui/material/Box';
import WithdrawContent from './components/WithdrawContent';

type Props = {
	params: Promise<{ local: Lang }>;
};

export default async function WithDraw({ params }: Props) {
	const { local } = await params;
	return (
		<Box className="sm:px-2 lg:px-3 min-h-[120vh]">
			<WithdrawContent local={local} />
		</Box>
	);
}
