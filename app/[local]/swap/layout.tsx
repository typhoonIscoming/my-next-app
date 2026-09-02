import Box from '@mui/material/Box';
import Header from './components/Header';

export default function SwapLayout({ children }: { children: React.ReactNode }) {
	return (
		<Box>
			<Header />
			{children}
		</Box>
	);
}
