import { defineRouting } from 'next-intl/routing';

// https://next-intl.dev/docs/routing/configuration
// 定义 Next.js 国际化路由配置
export const routing = defineRouting({
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
    localePrefix: 'always',
});
