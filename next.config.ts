import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// Next.js 16 引入了 use cache，允许我们对耗时的组件或函数进行独立的缓存，即使它们被用在动态页面中。
const nextConfig: NextConfig = {
	// ⚠️ 关键配置：开启 cacheComponents 以使用 'use cache' 指令
	// 注意：在 Next.js 16 最新版本中，dynamicIO 已被此选项取代
	cacheComponents: true,
	turbopack: {
		rules: {
			'*.svg': {
				loaders: [
					{
						loader: '@svgr/webpack',
						options: {
							svgoConfig: {
								plugins: [
									{
										name: 'removeAttrs',
										params: {
											attrs: '(fill|stroke|style)', // 移除这些属性
										},
									},
									{
										name: 'addAttributesToSVGElement',
										params: {
											attributes: [{ fill: 'currentColor' }], // 统一添加可继承颜色
										},
									},
								],
							},
						},
					},
				],
				as: '*.js', // 这个选项很关键，告诉 Turbopack 把结果当 JS 文件处理
			},
		},
	},
	// webpack(config) {
	// 	config.module.rules.unshift({
	// 		test: /\.svg$/i,
	// 		issuer: /\.[jt]sx?$/,
	// 		resourceQuery: { not: /url/ },
	// 		use: [
	// 			{
	// 				loader: '@svgr/webpack',
	// 				options: {
	// 					typescript: true,
	// 					ext: 'tsx', // 可根据需要调整
	// 					// 将 SVG 中的颜色转换为 currentColor，方便用 CSS 控制颜色
	// 					// icon: true,
	// 				},
	// 			},
	// 		],
	// 	});
	// 	return config;
	// },
};

export default withNextIntl(nextConfig);
