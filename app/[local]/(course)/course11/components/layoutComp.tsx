'use cache';

export default async function LayoutComp() {
    const dateStr = new Date().toLocaleTimeString();
    return (
        <div className="p-6 border rounded-lg shadow-lg bg-white mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-4">Course 11 Layout</h1>
            <div className="text-xs text-gray-400 mt-8">
                Static Generated at: {dateStr}
            </div>
        </div>
    );
}
