import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// Next.js 16 引入了 use cache，允许我们对耗时的组件或函数进行独立的缓存，即使它们被用在动态页面中。
const nextConfig: NextConfig = {
    // ⚠️ 关键配置：开启 cacheComponents 以使用 'use cache' 指令
    // 注意：在 Next.js 16 最新版本中，dynamicIO 已被此选项取代
    cacheComponents: true,
};

export default withNextIntl(nextConfig);
// export default nextConfig;
