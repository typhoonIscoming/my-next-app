import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { AddPosition, CreatePool, EmptyPool } from './PoolContent';
import { PoolTable } from '../components/PoolTable';
import { SwapProvider } from '../components/SwapContextProvider';

export default async function PoolPage() {
	const t = await getTranslations('swap');

	return (
		<SwapProvider>
			<main className="min-h-screen bg-[#050816] px-4 py-8 text-white sm:px-6 lg:px-8">
				<div className="mx-auto max-w-6xl">
					<div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div>
							<p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-300">
								{t('navPool')}
							</p>
							<h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-white">
								{t('positionSlogan')}
							</h1>
						</div>

						<Suspense>
							<AddPosition label={t('createPool')} />
						</Suspense>
					</div>

					<div className="mb-6">
						<CreatePool />
						<EmptyPool />
					</div>

					<section className="backdrop-blur-2xl">
						<div className="mb-5 flex items-center">
							<h2 className="text-lg font-semibold text-white">
								{t('popularPools')}
							</h2>
						</div>
						<PoolTable />
					</section>
				</div>
			</main>
		</SwapProvider>
	);
}
