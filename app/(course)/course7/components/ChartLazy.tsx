'use client';

import dynamic from 'next/dynamic';

// 服务器页面引用该包装组件，避免在 RSC 中直接使用 dynamic
const ChartLazy = dynamic(() => import('./ChartClient'), {
    ssr: false,
    loading: () => <div className="p-4">图表加载中…</div>,
});

export default function ClientChartLazy() {
    return <ChartLazy />;
}
