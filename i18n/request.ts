import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from './routing';

export const locales = routing.locales;

// https://next-intl.dev/docs/getting-started/app-router#using-requestconfig
// 配置 Next.js 国际化请求
export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = await requestLocale;

    // 如果用户访问了你不支持的语言（例如 /jp），我们用 notFound() 直接返回 404。
    // 对于初学者来说，这比“悄悄兜底到默认语言”更容易发现问题，也更利于排查线上错误链接
    if (!locale || !routing.locales.includes(locale as any)) {
        notFound();
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
});
