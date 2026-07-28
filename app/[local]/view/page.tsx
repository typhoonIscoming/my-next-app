import ViewDemo from './components/viewDemo';
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
			<div className="p-4 border shadow rounded-2xl">
				本页展示view用法
			</div>
			<ViewDemo />
		</div>
	);
}
