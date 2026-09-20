import Provider from '@/app/blockChainConfig/Provider';
import Header from './components/Header';

export default ({ children }: { children: React.ReactNode }) => {
	return (
		<Provider>
			<Header />
			<main>{children}</main>
		</Provider>
	);
};
