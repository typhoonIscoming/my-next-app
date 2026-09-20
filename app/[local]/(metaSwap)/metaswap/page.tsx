import { notFound } from 'next/navigation';
import Header from '../components/Header';

function assertValidLocale(locale: Lang) {
	if (!locale) {
		notFound();
	}
}

export default async function MetaSwapPage({ params }: { params: Promise<{ local: Lang }> }) {
	const { local } = await params;
	assertValidLocale(local);

	return <div className="min-h-[150vh]">MetaSwap Page</div>;
}
