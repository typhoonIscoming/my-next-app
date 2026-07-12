'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function CssVariableDemo() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    console.log('Current theme:', theme);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <div className="p-6 rounded-xl border border-border bg-background text-foreground shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Semantic Colors Demo</h3>
                <button
                    onClick={() =>
                        setTheme(theme === 'dark' ? 'light' : 'dark')
                    }
                    className="px-3 py-1 text-sm rounded-md bg-foreground text-background font-medium"
                >
                    Toggle Theme
                </button>
            </div>
            <div
                className={cn(
                    'w-full rounded-full',
                    'p-4 mt-4',
                    theme === 'dark' ? 'bg-red-500' : 'bg-yellow-500'
                )}
            >
                使用cn函数来动态设置类名，确保在切换主题时颜色正确显示。
            </div>
        </div>
    );
}
