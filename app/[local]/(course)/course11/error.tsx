'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
            <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card p-8 shadow-sm">
                <div className="mb-6 space-y-3">
                    <p className="text-sm font-medium text-destructive">
                        页面加载出错
                    </p>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        发生了意外错误
                    </h1>
                    <p className="text-sm leading-6 text-muted-foreground">
                        当前页面在渲染过程中出现了问题。你可以重试，或者返回首页继续浏览。
                    </p>
                </div>

                <div className="mb-6 rounded-lg border border-dashed border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">错误信息</p>
                    <p className="mt-2 break-all">{error.message}</p>
                    {error.digest ? (
                        <p className="mt-2 text-xs">错误编号: {error.digest}</p>
                    ) : null}
                </div>

                <div className="flex flex-wrap gap-3">
                    <Button onClick={reset}>重试</Button>
                    <Button asChild variant="outline">
                        <Link href="/">返回首页</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
