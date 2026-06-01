export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-24 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-10 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-4xl font-semibold">用户仪表盘</h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          这是一个受保护的页面，只有已登录用户可以访问。
        </p>
        <div className="mt-8 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
          <p>如果你已登录，你可以继续浏览其他受保护页面。</p>
          <p>
            管理员专用页面：
            <a href="/admin" className="font-semibold text-slate-900 underline dark:text-slate-100">
              前往管理员页面
            </a>
          </p>
          <p>
            退出登录：
            <a href="/login" className="font-semibold text-slate-900 underline dark:text-slate-100">
              返回登录页面并登出
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
