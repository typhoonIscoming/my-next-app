import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { connection } from 'next/server';

export async function GET(request: NextRequest) {
	try {
		// API Error: Error: Route /api/pools needs to bail out of prerendering at this point because it used nextUrl.searchParams.
		// at GET (app/api/pools/route.ts:6:11)
		// 这个报错在 Next.js 的 Route Handler 中通常不是真正的“错误”，而是 Next.js
		// 在构建时尝试预渲染你的 API 路由，发现你读取了 nextUrl.searchParams（动态请求数据），于是主动中断预渲染的“信号”
		// 在 Next.js 16（开启 Cache Components / PPR）下，GET 路由处理器在构建时会被“探测”是否可静态化。
		// 当你访问 request.nextUrl.searchParams 或 request.url 时，Next.js 会抛出这个特殊的中断信号，表示该路由必须动态渲染
		// 推荐：在 GET 函数顶部加入 await connection()
		// 这是最干净的修复方式，明确告诉 Next.js 不要尝试预渲染这个路由，直接走动态渲染。
		await connection(); // Ensure dynamic rendering and bail out of prerendering

		const { searchParams } = request.nextUrl;
		const limit = parseInt(searchParams.get('limit') || '10');
		const page = parseInt(searchParams.get('page') || '1');
		const offset = (page - 1) * limit;

		// Fetch pools with token information
		const {
			data: pools,
			error,
			count,
		} = await supabase
			.from('pools')
			.select(
				`
        *,
        token0_data:tokens!token0(symbol, decimals),
        token1_data:tokens!token1(symbol, decimals)
      `,
				{ count: 'exact' }
			)
			.range(offset, offset + limit - 1)
			.order('liquidity', { ascending: false });

		if (error) {
			console.error('Supabase error:', error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// Process and format data
		const formattedPools = pools.map((pool: any) => ({
			pool: pool.address,
			token0: pool.token0,
			token1: pool.token1,
			token0Symbol: pool.token0_data?.symbol || 'UNK',
			token1Symbol: pool.token1_data?.symbol || 'UNK',
			token0Decimals: pool.token0_data?.decimals || 18,
			token1Decimals: pool.token1_data?.decimals || 18,
			fee: pool.fee,
			feePercent: `${(pool.fee / 10000).toFixed(2)}%`,
			liquidity: pool.liquidity,
			sqrtPriceX96: pool.sqrt_price_x96,
			tick: pool.tick,
			poolIndex: pool.pool_index ?? 0,
			// Calculate TVL, Volume, Fees - For now using placeholders or basic calculations
			// Ideally these should come from aggregated tables or real-time calculations
			tvl: '0', // TODO: Calculate from liquidity and price
			tvlUSD: 0, // TODO: Fetch price
			volume24h: '0', // TODO: Aggregate from swaps
			feesUSD: 0, // TODO: Aggregate from fees
			pair: `${pool.token0_data?.symbol || 'UNK'} / ${pool.token1_data?.symbol || 'UNK'}`,
			index: pool.pool_index ?? 0,
			token0Balance: '0', // Needs on-chain call or indexer balance tracking
			token1Balance: '0',
		}));

		return NextResponse.json({
			data: formattedPools,
			pagination: {
				total: count,
				page,
				limit,
				totalPages: count ? Math.ceil(count / limit) : 0,
			},
		});
	} catch (error) {
		console.error('API Error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
