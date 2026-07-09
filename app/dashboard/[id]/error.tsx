'use client';
// 错误组件必须是客户端组件
import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // 可以将错误上报给日志服务
        console.error(error);
    }, [error]);

    const handleReset = () => {
        reset();
        // 这里强制刷新页面重新加载页面
        window.location.reload();
    };

    return (
        <div className="p-8">
            <h2 className="text-xl font-bold">加载文章失败了！</h2>
            <button
                type="button"
                onClick={handleReset}
                className="mt-4 rounded-md bg-red-500 p-2 text-white"
            >
                再试一次
            </button>
        </div>
    );
}
