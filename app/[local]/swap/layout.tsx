import Box from '@mui/material/Box';
import Header from './components/Header';
import WagmiProvider from '../wagmi/components/WagmiProvider';

export default function SwapLayout({ children }: { children: React.ReactNode }) {
	return (
		<WagmiProvider>
			<Header />
			{children}
		</WagmiProvider>
	);
}
