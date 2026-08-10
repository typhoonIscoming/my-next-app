import Box from '@mui/material/Box';
import ClaimContent from './components/ClaimContent';

type Props = {
	params: Promise<{ local: Lang }>;
};

export default async function Claim({ params }: Props) {
	const { local } = await params;

	return (
		<Box className="sm:px-2 lg:px-3 min-h-[120vh]">
			<ClaimContent local={local} />
		</Box>
	);
}
