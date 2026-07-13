import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

// https://next-intl.dev/docs/routing/navigation
// 创建 Next.js 国际化导航组件
export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);
