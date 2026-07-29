import TokenTransfer from './components/tokenTransfer';
type Props = {
	params: Promise<{ local: string }>;
};

export async function generateStaticParams() {
	return [{ local: 'zh' }];
}
export default async function ViewPage({ params }: Props) {
	const { local } = await params;

	return (
		<div className="p-4">
			<div className="p-4">本页展示view用法</div>
			<TokenTransfer />
		</div>
	);
}
