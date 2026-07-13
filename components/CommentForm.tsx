'use client';
import { useState } from 'react';

export default function CommentForm({
    onSubmit,
}: {
    onSubmit: (text: string) => Promise<void>;
}) {
    const [text, setText] = useState('');
    const [status, setStatus] = useState('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        setStatus('submitting');
        await onSubmit(text);
        setStatus('success');
        setText('');
    };

    return (
        <form onSubmit={handleSubmit} role="form">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="写下你的评论..."
                aria-label="comment-input"
            />
            <button type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? '提交中...' : '发布评论'}
            </button>
            {status === 'success' && <p>评论发布成功！</p>}
        </form>
    );
}
