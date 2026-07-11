import { headers, cookies } from 'next/headers';

import { getSecret } from '@/lib/secret';

export default async function PostsPage() {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
        // next: { revalidate: 120 },
        cache: 'no-store',
    });
    const posts = await res.json();

    const secretValue = await getSecret();
    console.log(
        'PostsPage 渲染了，当前时间：',
        new Date().toLocaleTimeString(),
        secretValue
    );

    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold mb-4">文章列表（120s ISR）</h1>
            <ul className="list-disc ml-6">
                {posts.map((p: any) => (
                    <li key={p.id}>{p.title}</li>
                ))}
            </ul>
        </main>
    );
}
