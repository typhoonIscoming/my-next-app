import { cacheLife } from 'next/cache'
type ListItem = {
	slug: string
}
type Props = {
	params: Promise<{ slug: string; local: string }>
}

async function getDoc(slug: string) {
	'use cache'

	cacheLife('minutes')
	const res = await fetch(
		`https://jsonplaceholder.typicode.com/posts/${slug}`
	)
	if (!res.ok) throw new Error('Doc not found')
	const doc = await res.json()
	console.log('doc', doc)
	return {
		...doc,
		generatedAt: new Date().toLocaleTimeString(),
	}
}

// 告诉 Next.js 在构建时预生成哪些 slug
export async function generateStaticParams() {
	// 获取前 10 篇文档的 ID
	// 基于时间的 ISR (Time-based)
	// 通过设置 revalidate 时间，允许页面在缓存过期后并在后台静默更新。
	// 页面依然是静态的（响应速度快）。
	// 如果缓存超过了 60 秒，下一个用户的请求会触发后台“静默更新”。
	// 更新成功后，缓存被替换。
	// const docs = await fetch('https://jsonplaceholder.typicode.com/posts', {
	// 	// 👇 关键修改：设置 revalidate 时间（秒）
	// 	next: { revalidate: 60 },
	// }).then((res) => res.json())

	// 必须返回一个对象数组，每个对象包含参数 (slug)
	return [{ local: 'zh', slug: '1' }]
}

export default async function DocPage({ params }: Props) {
	const { slug } = await params
	const doc = await getDoc(slug)
	console.log('DocPage params:', { slug, doc })
	return (
		<div className="prose mx-auto mt-10 p-6 border rounded-lg shadow-sm">
			<div className="mb-4 text-blue-600 font-bold uppercase tracking-wider">
				Documentation (SSG)
			</div>
			<h1 className="capitalize">{doc.title}</h1>
			<p>{doc.body}</p>
			<div className="text-xs text-gray-400 mt-8">
				Static Generated at: {doc.generatedAt}
			</div>
		</div>
	)
}
