import { Suspense } from 'react';
import ClientTime from '@/components/clientTime';
import GlobalStats from './components/GlobalStats';

type Props = {
    params: Promise<{ sku: string }>;
};

export async function generateStaticParams() {
    const newsItems = await fetch(
        'https://jsonplaceholder.typicode.com/photos/'
    ).then((res) => res.json());
    return newsItems.slice(0, 10).map((item: any) => ({
        sku: item.id.toString(),
    }));
}

async function getProduct(sku: string) {
    const res = await fetch(
        `https://jsonplaceholder.typicode.com/photos/${sku}`,
        {
            // 👇 关键修改：添加 tags，相当于给这个请求贴了个标签
            next: { tags: [`product-${sku}`] },
        }
    );
    if (!res.ok) throw new Error('Product not found');
    return res.json();
}

export default async function ProductPage({ params }: Props) {
    const { sku } = await params;
    // const product = await getProduct(sku);

    return (
        <div className="p-6 border rounded-lg shadow-lg bg-white mx-auto mt-10">
            <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-white bg-purple-600 rounded-full">
                On-demand ISR
            </div>
            <h1 className="text-2xl font-bold mb-2">Product #{sku}</h1>
            {/* <img
                src={product.thumbnailUrl}
                alt={product.title}
                className="w-32 h-32 rounded-md mb-4"
            /> */}
            {/* <p className="text-gray-600 mb-4 capitalize">{product.title}</p> */}
            <div className="text-3xl font-bold text-green-600">$99.99</div>
            <div className="text-xs text-gray-400 mt-4 border-t pt-2">
                Last Updated: <ClientTime />
            </div>
            <div className="mt-4" />
            <Suspense
                fallback={
                    <div className="mt-4 text-gray-400">Loading stats...</div>
                }
            >
                <GlobalStats />
            </Suspense>
        </div>
    );
}
