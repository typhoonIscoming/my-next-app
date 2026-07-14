import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import LayoutComp from './components/layoutComp';

type Props = {
    params: Promise<{ local: string }>;
};

export async function generateStaticParams() {
    return [{ local: 'zh' }];
}

export default function DocPage({ params }: Props) {
    return (
        <Suspense
            fallback={
                <div className="p-6 text-sm text-muted-foreground">
                    正在加载文档...
                </div>
            }
        >
            <DocContent params={params} />
        </Suspense>
    );
}

async function DocContent({ params }: Props) {
    const { local } = await params;
    setRequestLocale(local);
    const t = await getTranslations({ locale: local, namespace: 'HomePage' });

    return (
        <div className="prose mx-auto mt-10 p-6 border rounded-lg shadow-sm">
            <div className="mb-4 text-blue-600 font-bold uppercase tracking-wider">
                Documentation (SSG)
            </div>
            <div className="mb-4 text-sm text-muted-foreground">
                当前语言: <span className="font-medium">{local}</span>
            </div>
            <div className="mb-4 text-sm text-muted-foreground">
                翻译内容: <span className="font-medium">{t('title')}</span>
            </div>
            <div className="mb-4 text-sm text-muted-foreground">
                说明: 该页面使用 SSG 生成，且支持多语言。你可以在 URL
                中切换语言，例如{' '}
                <code className="bg-muted/50 px-1 rounded">/zh</code> 或{' '}
                <code className="bg-muted/50 px-1 rounded">/en</code>。
            </div>
            <LayoutComp />
        </div>
    );
}
