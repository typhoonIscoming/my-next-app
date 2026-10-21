# Next.js 16 `use cache` 与构建报错解决方案

## 问题背景

项目仓库：<https://github.com/typhoonIsComing/my-next-app>

项目使用：

- Next.js `16.2.6`
- React `19.2.4`
- next-intl `4.13.2`
- `cacheComponents: true`

执行以下命令时构建失败：

```bash
npm run build
```

主要错误为：

```text
Uncached data was accessed outside of <Suspense>
```

实际复现后发现问题不是一处，而是四类不同的动态数据没有按照 Cache Components 的规则处理。

## 一、修复国际化根布局

### 原因

`next-intl` 的 `getRequestConfig` 会读取 `requestLocale`。如果根布局没有通过 `setRequestLocale` 提供当前语言，Next.js 会把它识别为运行时数据。

报错堆栈指向：

```text
i18n/request.ts
app/[local]/layout.tsx
```

这不是 `admin/page.tsx` 自身的问题，而是所有页面都会经过的根布局问题。

### 修改方式

修改 `app/[local]/layout.tsx`：

```tsx
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import './globals.css';

import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { routing } from '@/i18n/routing';

import { NextIntlClientProvider } from 'next-intl';
import {
  getMessages,
  setRequestLocale,
} from 'next-intl/server';

export const metadata: Metadata = {
  title: 'Cinematic Space-Travel Landing Page',
  description:
    'A cinematic space travel landing page with liquid glass and motion.',
};

export function generateStaticParams() {
  return routing.locales.map((local) => ({ local }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ local: string }>;
}) {
  const { local } = await params;

  // 关键：让 next-intl 使用 URL 中已经解析出的语言，
  // 避免它再次从 requestLocale 获取运行时数据。
  setRequestLocale(local);

  const messages = await getMessages({ locale: local });

  return (
    <html
      lang={local}
      className={cn('h-full antialiased', 'font-sans')}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>

        <Toaster />
      </body>
    </html>
  );
}
```

不要为了绕过错误而在根布局顶部直接添加：

```tsx
'use cache';
```

这个布局依赖动态路由的 `params`。这里应该使用 `generateStaticParams()` 和 `setRequestLocale()` 明确提供可预渲染的语言参数。

## 二、缓存 `getDoc()` 数据请求

### 原因

Next.js 16 启用 Cache Components 后，普通异步请求默认被认为需要在每次请求时执行。

`course11/[slug]/page.tsx` 中的 `getDoc()` 没有缓存，也没有位于 `Suspense` 边界内，因此构建失败。

这个页面演示的是静态生成和缓存，因此正确处理是缓存数据，而不是把它改为动态流式渲染。

### 修改方式

修改 `app/[local]/(course)/course11/[slug]/page.tsx`：

```tsx
import { cacheLife } from 'next/cache';

type Props = {
  params: Promise<{
    slug: string;
    local: string;
  }>;
};

async function getDoc(slug: string) {
  'use cache';

  cacheLife('minutes');

  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${slug}`
  );

  if (!res.ok) {
    throw new Error('Doc not found');
  }

  const doc = await res.json();

  return {
    ...doc,
    // 当前时间也必须在缓存作用域中生成。
    generatedAt: new Date().toLocaleTimeString(),
  };
}

export async function generateStaticParams() {
  return [
    {
      local: 'zh',
      slug: '1',
    },
  ];
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const doc = await getDoc(slug);

  return (
    <div className="prose mx-auto mt-10 rounded-lg border p-6 shadow-sm">
      <div className="mb-4 font-bold uppercase tracking-wider text-blue-600">
        Documentation (SSG)
      </div>

      <h1 className="capitalize">{doc.title}</h1>
      <p>{doc.body}</p>

      <div className="mt-8 text-xs text-gray-400">
        Static Generated at: {doc.generatedAt}
      </div>
    </div>
  );
}
```

### `generateStaticParams()` 的原有错误

错误写法：

```tsx
return [{ local: 'zh' }, { slug: '1' }];
```

这代表两个互不相关的路由参数对象，并不是同一个 `/zh/course11/1` 路由。

正确写法：

```tsx
return [{ local: 'zh', slug: '1' }];
```

## 三、处理 Server Component 中的当前时间

启用 Cache Components 后，不能在待预渲染的 Server Component JSX 中直接读取当前时间：

```tsx
// 错误
<div>{new Date().toLocaleTimeString()}</div>
```

因为当前时间每次执行都不同，Next.js 会将它识别为动态值。

如果它表示“缓存生成时间”，应当在 `'use cache'` 函数中生成：

```tsx
async function getDoc(slug: string) {
  'use cache';

  const doc = await fetchDoc(slug);

  return {
    ...doc,
    generatedAt: new Date().toLocaleTimeString(),
  };
}
```

页面只渲染已经缓存的结果：

```tsx
<div>Static Generated at: {doc.generatedAt}</div>
```

如果需要显示用户电脑上的实时时间，则应当放进 Client Component。

## 四、为 `searchParams` 添加 Suspense

### 原因

`searchParams` 属于请求级运行时数据，不能放进共享的 `'use cache'` 作用域。

原来的 `course8/page.tsx` 直接在页面组件中执行：

```tsx
const { query, page } = await searchParams;
```

这会阻塞整个页面的预渲染。

### 修改方式

把读取 `searchParams` 的逻辑下移到异步子组件，再使用 `Suspense` 包裹：

```tsx
import { Suspense } from 'react';

type Props = {
  params?: Promise<{ local: string }>;
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
};

export default function Course8Page({ searchParams }: Props) {
  return (
    <Suspense
      fallback={<div className="p-4">Loading course 8...</div>}
    >
      <Course8Content searchParams={searchParams} />
    </Suspense>
  );
}

async function Course8Content({
  searchParams,
}: Pick<Props, 'searchParams'>) {
  const { query = '', page = '1' } = await searchParams;

  return (
    <div>
      <h1>Course 8</h1>
      <p>Query: {query}</p>
      <p>Page: {page}</p>
    </div>
  );
}
```

## 五、为 `cache: 'no-store'` 请求添加 Suspense

### 原因

`cache: 'no-store'` 表示数据必须在每一次请求时重新获取，不能加入共享缓存。

因此它应该由 `Suspense` 提供加载界面。

### 修改方式

修改 `course6/page.tsx`：

```tsx
import { Suspense } from 'react';

export default function PostsPage() {
  return (
    <Suspense
      fallback={
        <main className="p-8">
          正在加载文章...
        </main>
      }
    >
      <PostsContent />
    </Suspense>
  );
}

async function PostsContent() {
  const res = await fetch(
    'https://jsonplaceholder.typicode.com/posts',
    {
      cache: 'no-store',
    }
  );

  const posts = await res.json();

  return (
    <main className="p-8">
      <h1 className="mb-4 text-2xl font-bold">
        文章列表
      </h1>

      <ul className="ml-6 list-disc">
        {posts.map((post: { id: number; title: string }) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </main>
  );
}
```

## 判断规则

可以按照下面的规则判断应该使用 `'use cache'` 还是 `Suspense`：

| 数据类型 | 推荐处理方式 |
|---|---|
| 可以跨请求复用的数据 | `'use cache'` + `cacheLife()` |
| 按需失效的缓存数据 | `'use cache'` + `cacheTag()` |
| `searchParams` | 异步子组件 + `Suspense` |
| `cookies()`、`headers()` | 异步子组件 + `Suspense` |
| `cache: 'no-store'` 请求 | 异步子组件 + `Suspense` |
| 动态语言参数 | `generateStaticParams()` + `setRequestLocale()` |
| 缓存生成时间 | 在 `'use cache'` 作用域内生成 |
| 浏览器实时时间 | Client Component |

简单记忆：

```text
允许复用的数据       → use cache
必须按请求读取的数据 → Suspense
```

`'use cache'` 与 `Suspense` 并不是所有异步组件都要同时使用。它们代表两种不同的数据处理意图。

## 构建验证

完成以上修改后，实际执行：

```bash
npm run build
```

构建结果：

```text
✓ Compiled successfully
✓ Finished TypeScript
✓ Generating static pages (39/39)
✓ Finalizing page optimization
```

最终路由同时包含：

- 静态预渲染内容
- Partial Prerender 页面
- `/api/revalidate` 动态 Route Handler

## 剩余警告

构建成功后还有两个不影响构建的警告。

### 1. `middleware.ts` 已弃用

Next.js 16 建议以后将：

```text
middleware.ts
```

迁移为：

```text
proxy.ts
```

这不是当前构建失败的原因，可以后续单独迁移。

### 2. 存在多个 `package-lock.json`

如果终端提示 Next.js 检测到多个 lockfile，需要检查项目父目录是否还有不需要的 `package-lock.json`，或者在 `next.config.ts` 中显式配置 `turbopack.root`。

该警告也不是本次 Cache Components 报错的原因。

## 参考资料

- [Next.js：Uncached data was accessed outside of Suspense](https://nextjs.org/docs/messages/blocking-route)
- [Next.js：Dynamic Routes with Cache Components](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes)
- [Next.js：Cache Components](https://nextjs.org/docs/app/getting-started/partial-prerendering)
- [next-intl 官方文档](https://next-intl.dev/docs/getting-started/app-router)

