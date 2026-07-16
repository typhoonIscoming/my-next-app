import type { Metadata } from 'next'

interface DashboardPageParams {
	id: string
}

interface DashboardPageProps {
	params: Promise<DashboardPageParams>
}

type Props = {
	params: Promise<{ local: string; id: string }>
	searchParams: Promise<{ id: string }>
}

export async function generateStaticParams() {
	return [{ local: 'zh' }]
}

export async function generateMetadata({
	params,
}: DashboardPageProps): Promise<Metadata> {
	const { id } = await params

	return {
		title: `仪表盘详情 - ${id}`,
		description: `查看仪表盘 ${id} 的详细信息。`,
	}
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
let attemptCount = 0

export default async function DashboardItemPage({ params, searchParams }: Props) {
	const { id } = await params
	await sleep(5000)
	attemptCount += 1
	console.log('当前尝试次数:', attemptCount)

	if (attemptCount === 1) {
		throw new Error('模拟加载失败，请重试。')
	}

	return (
		<main className="min-h-screen bg-slate-950 text-slate-100 p-8">
			<div className="mx-auto max-w-4xl space-y-8 rounded-3xl border border-slate-700/70 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
				<header className="space-y-3">
					<p className="text-sm uppercase tracking-[0.28em] text-cyan-400/80">
						仪表盘项目
					</p>
					<h1 className="text-4xl font-semibold text-white">
						当前路由参数：{id}
					</h1>
					<p className="max-w-2xl text-slate-400">
						这是一个演示页面，展示如何在 Next.js App Router
						中获取动态路由参数并将它们用于页面内容和元数据。
					</p>
				</header>

				<section className="grid gap-4 md:grid-cols-2">
					<div className="rounded-3xl bg-slate-800/80 p-6 ring-1 ring-slate-700/60">
						<h2 className="text-xl font-semibold text-white">
							参数信息
						</h2>
						<p className="mt-3 text-slate-300">
							当前 id 参数的值是：
						</p>
						<pre className="mt-4 rounded-2xl bg-slate-950 p-4 text-sm text-cyan-300">
							{id}
						</pre>
					</div>

					<div className="rounded-3xl bg-slate-800/80 p-6 ring-1 ring-slate-700/60">
						<h2 className="text-xl font-semibold text-white">
							示例内容
						</h2>
						<ul className="mt-3 space-y-3 text-slate-300">
							<li>• 一个动态仪表盘项页面</li>
							<li>• 使用 params 获取路由值</li>
							<li>• 展示可视化文本和元数据标题</li>
						</ul>
					</div>
				</section>

				<footer className="rounded-3xl bg-slate-950/90 p-6 text-slate-400 ring-1 ring-slate-700/60">
					<p>路径示例：/dashboard/{id}</p>
				</footer>
			</div>
		</main>
	)
}
