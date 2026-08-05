import Box from '@mui/material/Box';
import LayoutSetting from './components/LayoutSetting';

type Props = {
	params: Promise<{ local: Lang }>;
	children: React.ReactNode;
};

export default async function Layout({ children, params }: Props) {
	const { local } = await params;
	return (
		<Box className="stake-layout">
			<Box className="p-4 flex justify-center sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
				<Box className="flex flex-1 justify-end"></Box>
				<Box className="flex items-center gap-4">
					<LayoutSetting local={local} />
				</Box>
			</Box>
			{children}
		</Box>
	);
}
