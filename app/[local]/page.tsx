'use cache'
import Image from 'next/image'

type Props = {
	params: Promise<{ local: string }>
}

export async function generateStaticParams() {
	return [{ local: 'zh' }]
}

export default async function Home({ params }: Props) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<main className="flex w-full max-w-4xl flex-col items-center justify-center gap-10 rounded-3xl bg-white p-10 shadow-xl dark:bg-zinc-950">
				<div className="flex flex-col items-center gap-6 text-center">
					<Image
						className="dark:invert"
						src="/next.svg"
						alt="Next.js logo"
						width={100}
						height={20}
						priority
					/>
					<div>
						<h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
							添加路由权限示例
						</h1>
						<p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
							当前示例通过 `middleware.ts`
							为受保护路由添加权限判断，未登录用户将被重定向到登录页。
						</p>
					</div>
				</div>

				<div className="grid w-full gap-4 sm:grid-cols-3">
					<a
						href="/login"
						className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
					>
						<h2 className="text-xl font-semibold">登录页面</h2>
						<p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
							登录并设置角色
						</p>
					</a>
					<a
						href="/dashboard"
						className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
					>
						<h2 className="text-xl font-semibold">用户仪表盘</h2>
						<p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
							受保护路由，需登录后访问
						</p>
					</a>
					<a
						href="/admin"
						className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
					>
						<h2 className="text-xl font-semibold">管理员页面</h2>
						<p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
							仅管理员角色可访问的受保护路由
						</p>
					</a>
				</div>
			</main>
		</div>
	)
}
