import Provider from '@/app/blockChainConfig/Provider';

export default ({ children }: { children: React.ReactNode }) => {
	return <Provider>{children}</Provider>;
};
