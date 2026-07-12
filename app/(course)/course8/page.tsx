import SearchBar from '@/components/SearchBar';
import ChangeTheme from './components/changeTheme';

export default async function Course8Page({
    searchParams,
}: {
    // Next.js 15+ 中 searchParams 是 Promise
    searchParams: Promise<{ query?: string; page?: string }>;
}) {
    const { query = '', page = '1' } = await searchParams;
    console.log('Course 8 searchParams:', { query, page });
    // 直接在服务端请求数据，SEO 友好，无 Loading 闪烁
    //   const products = await fetchProducts(query, Number(page))
    return (
        <div className="p-4 rounded-xl bg-white shadow-lg transition-colors duration-200 dark:bg-slate-800 dark:border dark:border-slate-700 border-red-100 border">
            <h1>Course 8</h1>
            <div className="w-[500px]">
                <SearchBar />
            </div>
            <div className="mt-4">
                <ChangeTheme />
            </div>
        </div>
    );
}
