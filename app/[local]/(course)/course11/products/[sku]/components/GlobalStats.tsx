// 👇 Next.js 16 新特性：声明此函数/组件的返回值是可以被缓存的
'use cache';

async function getGlobalStats() {
    // 模拟耗时计算 (3秒)
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return {
        totalUsers: '1,203,400',
        activeRegions: 15,
        serverStatus: '99.9% Uptime',
    };
}

export default async function GlobalStats() {
    const stats = await getGlobalStats();
    console.log('Global Stats:', stats);
    return (
        <div className="border border-cyan-400 p-4">
            <h2 className="text-xl font-bold mb-4">Global Stats</h2>
            <ul className="space-y-2">
                <li>Total Users: {stats.totalUsers}</li>
                <li>Active Regions: {stats.activeRegions}</li>
                <li>Server Status: {stats.serverStatus}</li>
            </ul>
        </div>
    );
}
