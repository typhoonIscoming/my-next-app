type Props = {
	params: Promise<{ local: string }>
}

export async function generateStaticParams() {
	return [{ local: 'zh' }]
}

export default function AdminPage({ params }: Props) {
	return (
		<div className="min-h-screen bg-zinc-50 px-6 py-24 text-zinc-900 dark:bg-black dark:text-zinc-50">
			<div className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-10 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
				<h1 className="text-4xl font-semibold">管理员控制面板</h1>
				<p className="mt-4 text-zinc-600 dark:text-zinc-400">
					仅管理员可以访问此页面。
				</p>
				<div className="mt-8 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
					<p>成功访问后台管理页面说明路由权限规则已生效。</p>
					<p>
						退出登录：
						<a
							href="/login"
							className="font-semibold text-slate-900 underline dark:text-slate-100"
						>
							返回登录页面并登出
						</a>
						<a href="/dashboard" className="ml-4">
							首页
						</a>
					</p>
				</div>
			</div>
		</div>
	)
}
