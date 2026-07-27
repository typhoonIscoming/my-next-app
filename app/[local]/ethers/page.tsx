import LinkEthers from './components/linkEthers';
import { getTranslations } from 'next-intl/server';

type Props = {
	params: Promise<{ local: string }>;
};

export async function generateStaticParams() {
	return [{ local: 'zh' }];
}
export default async function EthersPage({ params }: Props) {
	const { local } = await params;

	return (
		<div className="p-4">
			<div className="p-4 border shadow rounded-2xl">
				本页展示ether.js用法
			</div>
			<LinkEthers local={local} />
		</div>
	);
}
