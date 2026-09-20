import Provider from '@/app/blockChainConfig/Provider';
import Header from './components/Header';

export default ({ children }: { children: React.ReactNode }) => {
	return (
		<Provider>
			<Header />
			<main className='max-w-[1440px] m-auto px-4 py-4 sm:px-6 lg:px-8 pt-0"'>
				{children}
			</main>
		</Provider>
	);
};
