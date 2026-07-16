import Link from 'next/link'

const stats = [
	{ label: '总用户', value: '1,248' },
	{ label: '活跃会话', value: '73' },
	{ label: '待处理请求', value: '12' },
	{ label: '错误率', value: '0.8%' },
]

const cards = [
	{
		title: '系统状态',
		description: '检查服务可用性和健康状态。',
		href: '/admin/dashboard/status',
	},
	{
		title: '用户管理',
		description: '查看用户列表、权限和角色。',
		href: '/admin/dashboard/users',
	},
	{
		title: '交易记录',
		description: '审计最近区块链交易和日志。',
		href: '/admin/dashboard/transactions',
	},
]

type Props = {
	params?: Promise<{ local: string }>
	searchParams: Promise<{ query?: string; page?: string }>
}

export async function generateStaticParams() {
	return [{ local: 'zh' }]
}

export default function DashboardPage({ params }: Props) {
	return (
		<main className="min-h-screen bg-slate-950 text-slate-100 p-6">
			<section className="mx-auto max-w-6xl space-y-8">
				<div className="rounded-3xl bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20 ring-1 ring-slate-600/40">
					<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-sm uppercase tracking-[0.24em] text-slate-400">
								管理员仪表盘
							</p>
							<h1 className="mt-2 text-4xl font-semibold text-white">
								欢迎回来，管理员
							</h1>
						</div>
						<Link
							href="/admin/login"
							className="inline-flex items-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
						>
							登出
						</Link>
					</div>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{stats.map((item) => (
							<div
								key={item.label}
								className="rounded-3xl bg-slate-800 p-6 ring-1 ring-slate-700/60"
							>
								<p className="text-sm text-slate-400">
									{item.label}
								</p>
								<p className="mt-4 text-3xl font-semibold text-white">
									{item.value}
								</p>
							</div>
						))}
					</div>
				</div>

				<section className="grid gap-4 lg:grid-cols-3">
					{cards.map((card) => (
						<Link
							key={card.title}
							href={card.href}
							className="group rounded-3xl border border-slate-700/70 bg-slate-900/90 p-6 transition hover:-translate-y-1 hover:border-cyan-500/80 hover:bg-slate-800"
						>
							<h2 className="text-xl font-semibold text-white group-hover:text-cyan-400">
								{card.title}
							</h2>
							<p className="mt-3 text-slate-400">
								{card.description}
							</p>
						</Link>
					))}
				</section>
			</section>
		</main>
	)
}
