import { headers, cookies } from 'next/headers'

import { getSecret } from '@/lib/secret'

// RSC 不支持浏览器端交互（不能用 useState/useEffect，也不能绑事件），但可以渲染客户端组件并传递可序列化的 props。配合方式很简单：
// RSC 做数据与模板拼装。
// 客户端组件承接交互与副作用。

type Props = {
	params: Promise<{ local: string }>
}

export async function generateStaticParams() {
	return [{ local: 'zh' }]
}

export default async function PostsPage({ params }: Props) {
	const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
		// next: { revalidate: 120 },
		cache: 'no-store',
	})
	const posts = await res.json()

	const secretValue = await getSecret()
	console.log('PostsPage 渲染了，当前时间：', secretValue)

	return (
		<main className="p-8">
			<h1 className="text-2xl font-bold mb-4">文章列表（120s ISR）</h1>
			<ul className="list-disc ml-6">
				{posts.map((p: any) => (
					<li key={p.id}>{p.title}</li>
				))}
			</ul>
		</main>
	)
}
