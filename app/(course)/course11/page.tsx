type Props = {
    params: Promise<{ slug: string }>;
};

export default async function DocPage({ params }: Props) {
    const { slug } = await params;

    return (
        <div className="prose mx-auto mt-10 p-6 border rounded-lg shadow-sm">
            <div className="mb-4 text-blue-600 font-bold uppercase tracking-wider">
                Documentation (SSG)
            </div>
            <div className="text-xs text-gray-400 mt-8">
                Static Generated at: {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
}
