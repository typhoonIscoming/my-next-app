import Box from '@mui/material/Box';
import ChangeLanguage from './components/changeLanguange';

type Props = {
	params: Promise<{ local: Lang }>;
	children: React.ReactNode;
};

export default async function Layout({ children, params }: Props) {
	const { local } = await params;
	return (
		<Box className="stake-layout">
			<Box className="p-4 flex justify-end sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				<ChangeLanguage local={local}></ChangeLanguage>
			</Box>
			{children}
		</Box>
	);
}
