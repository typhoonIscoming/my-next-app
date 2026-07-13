import { connection } from 'next/server';
import { cookies } from 'next/headers';
import LayoutComp from './components/layoutComp';

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function DocPage() {
    return (
        <div className="prose mx-auto mt-10 p-6 border rounded-lg shadow-sm">
            <div className="mb-4 text-blue-600 font-bold uppercase tracking-wider">
                Documentation (SSG)
            </div>
            <LayoutComp />
        </div>
    );
}
