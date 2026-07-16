import { Suspense } from 'react'

import Content from './components/content'

type Props = {
	params: Promise<{ local: string }>
}

export async function generateStaticParams() {
	return [{ local: 'zh' }]
}

export default function LoginPage({ params }: Props) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<Content />
		</Suspense>
	)
}
