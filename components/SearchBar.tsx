'use client';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce'; // 强烈建议防抖

export default function SearchBar() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    // 核心逻辑：修改 URL 参数，而不是修改本地 State
    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }

        // replace vs push:
        // 筛选/搜索用 replace（替换当前历史，后退不麻烦）
        // 分页/跳转用 push（保留历史，方便后退）
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    return (
        <input
            // 初始值从 URL 拿，确保刷新后数据还在
            defaultValue={searchParams.get('query')?.toString()}
            onChange={(e) => handleSearch(e.target.value)}
            className="border p-2 rounded"
            placeholder="搜索..."
        />
    );
}
