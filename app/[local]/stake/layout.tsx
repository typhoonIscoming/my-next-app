import Box from '@mui/material/Box';
import LayoutSetting from './components/LayoutSetting';

type Props = {
	params: Promise<{ local: string }>;
	children: React.ReactNode;
};

export default async function Layout({ children, params }: Props) {
	const { local } = await params;
	return (
		<Box className="stake-layout">
			<Box className="sticky top-0 z-50 w-full border-b border-white/10 dark:bg-zinc-950/95 shadow-[0_2px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl">
				<Box className="mx-auto flex w-full max-w-7xl items-center justify-between py-2 sm:px-4 lg:px-6">
					<Box className="flex items-center gap-2 text-sm font-medium dark:text-zinc-300">
						<Box className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.7)]" />
						<span>Stake</span>
					</Box>
					<Box className="flex items-center gap-3">
						<LayoutSetting local={local as Lang} />
					</Box>
				</Box>
			</Box>
			{children}
		</Box>
	);
}
