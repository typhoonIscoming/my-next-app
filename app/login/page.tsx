"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/dashboard";
  const error = searchParams.get("error");
  const [status, setStatus] = useState("");

  const login = (role: string) => {
    document.cookie = `auth=true; path=/; max-age=${60 * 60}`;
    document.cookie = `role=${role}; path=/; max-age=${60 * 60}`;
    setStatus(`已登录为 ${role}，正在跳转...`);
    router.push(from);
  };

  const logout = () => {
    document.cookie = "auth=; path=/; max-age=0";
    document.cookie = "role=; path=/; max-age=0";
    setStatus("已退出登录。");
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-24 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-10 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-3xl font-semibold">登录以访问受保护路由</h1>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          选择一个角色进行登录，然后访问受保护页面。
        </p>

        {error === "permission" ? (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/20 dark:text-rose-300">
            当前用户没有访问该页面的权限，请使用管理员账号登录。
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            onClick={() => login("user")}
          >
            登录为普通用户
          </button>
          <button
            className="rounded-full border border-slate-900 px-5 py-3 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-100 dark:hover:bg-slate-800"
            onClick={() => login("admin")}
          >
            登录为管理员
          </button>
        </div>

        <button
          className="mt-6 rounded-full border border-rose-600 px-5 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-300 dark:text-rose-300 dark:hover:bg-rose-950/20"
          onClick={logout}
        >
          退出登录
        </button>

        {status ? <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">{status}</p> : null}
      </div>
    </div>
  );
}
