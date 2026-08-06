import Box from '@mui/material/Box';
import ContentTitle from './components/ContentTitle';

type Props = {
	params: Promise<{ local: Lang }>;
};

export default async function Stake({ params }: Props) {
	const { local } = await params;
	return (
		<Box className="sm:px-4 lg:px-6 min-h-[120vh]">
			<ContentTitle local={local} />
		</Box>
	);
}
