// components/CommentClientForm.tsx（客户端组件，用事件/副作用调用 Server Action）
'use client';
import { useTransition, useState } from 'react';
import { addComment } from '@/actions/comments/action';

export default function CommentClientForm() {
    const [content, setContent] = useState('');
    const [pending, startTransition] = useTransition();
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                // 在客户端事件中手动构造 FormData 并调用 Server Action
                // 使用 useTransition 展示“提交中”状态，不阻塞输入
                const fd = new FormData();
                fd.append('content', content);
                console.log('客户端事件调用 addComment，内容：', content);
                startTransition(() => {
                    console.log('startTransition 执行中，pending:', fd);
                    const excute = async () => {
                        await addComment(fd);
                    };
                    excute();
                    // 提交成功后清空输入框
                    setContent('');
                });
            }}
            className="p-8 flex gap-2"
        >
            <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="客户端组件--输入评论"
                className="px-3 py-2 border rounded flex-1"
            />
            <button
                disabled={pending}
                className="px-3 py-2 border rounded disabled:opacity-60"
            >
                {pending ? '提交中…' : '提交'}
            </button>
        </form>
    );
}
