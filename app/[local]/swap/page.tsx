import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ArrowDownSvgIcon } from './components/CustomSvgIcon';
import SwapContent from './components/SwapContent';

function assertValidLocale(locale: Lang) {
	if (!locale) {
		notFound();
	}
}

export default async function SwapPage({ params }: { params: Promise<{ local: Lang }> }) {
	const { local } = await params;
	assertValidLocale(local);

	return (
		<main className="min-h-screen bg-[#131313] text-white">
			<div className="mx-auto max-w-[1440px] px-4 pb-10 pt-4 sm:px-6 lg:px-8">
				<section className="flex min-h-[calc(100vh-120px)] items-center justify-center py-10">
					<SwapContent />
				</section>
			</div>
		</main>
	);
}
