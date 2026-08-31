import { Suspense } from 'react';
import SwapLoading from './loading';

async function waitForSwapPage() {
	await new Promise((resolve) => setTimeout(resolve, 5000));
}

export default async function SwapPage() {
	await waitForSwapPage();

	return (
		<Suspense fallback={<SwapLoading />}>
			<div>Swap Page</div>
		</Suspense>
	);
}
