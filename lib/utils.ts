import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type Address } from 'viem';
import { BaseError } from 'viem';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const sepoliaContractAddress = process.env.NEXT_PUBLIC_SOPOLIA_ADDRESS as `0x${string}`;

export const mainnetNetUrl =
	process.env.NEXT_PUBLIC_MAINNET_RPC_URL ?? process.env.NEXT_PUBLIC_RPC_URL;

export const sepoliaNetUrl =
	process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? process.env.NEXT_PUBLIC_RPC_URL;

export const stakeContractAddress = process.env
	.NEXT_PUBLIC_STAKE_ADDRESS as `0x${string}` as Address;

// utils/menuMatch.ts
export function isMenuActive(currentPath: string, menuPath: string): boolean {
	// 精确匹配
	if (currentPath === menuPath) return true;

	// 子路径匹配（需要确保菜单路径不是根路径）
	if (menuPath !== '/' && currentPath.startsWith(menuPath + '/')) return true;

	// 动态路由匹配，如 /users/[id]
	if (menuPath.includes('[') && menuPath.includes(']')) {
		// 将动态路径转换为正则
		const pattern = menuPath.replace(/\[.*?\]/g, '[^/]+').replace(/\//g, '\\/');
		const regex = new RegExp(`^${pattern}$|^${pattern}\\/`);
		return regex.test(currentPath);
	}

	return false;
}

// swap合约相关
// poolManager合约地址
export const poolManagerAddress = process.env.NEXT_PUBLIC_POOL_MANAGER_ADDRESS as `0x${string}`;

// positions合约地址
export const positionsAddress = process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS as `0x${string}`;

// swap合约地址
export const swapAddress = process.env.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS as `0x${string}`;

export const formatAddress = (address?: string) => {
	if (!address) return 'UNKNOWN';
	return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// 格式化数字
export function formatNumber(num: number): string {
	if (num === 0) return '0';
	if (num < 0.001) return '<0.001';
	if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
	if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
	return num.toFixed(3).replace(/\.?0+$/, '');
}

// 代币地址
export const tokenA = process.env.NEXT_PUBLIC_MN_TOKEN_A as `0x${string}`;
export const tokenB = process.env.NEXT_PUBLIC_MN_TOKEN_B as `0x${string}`;
export const tokenC = process.env.NEXT_PUBLIC_MN_TOKEN_C as `0x${string}`;
export const tokenD = process.env.NEXT_PUBLIC_MN_TOKEN_D as `0x${string}`;

// token列表
export const tokenList = [
	{ address: tokenA, name: 'tokenA' },
	{ address: tokenB, name: 'tokenB' },
	{ address: tokenC, name: 'tokenC' },
	{ address: tokenD, name: 'tokenD' },
];
// 判断是哪一个token
export const getToken = (address: `0x${string}`) => {
	if (address === tokenA) return 'tokenA';
	if (address === tokenB) return 'tokenB';
	if (address === tokenC) return 'tokenC';
	if (address === tokenD) return 'tokenD';
	if (address) return formatAddress(address);
	return null;
};
const WETH_ADDRESS = process.env.NEXT_PUBLIC_WETH9_ADDRESS || process.env.NEXT_PUBLIC_WETH_ADDRESS;
// 测试代币地址
export const tokens = {
	ETH: {
		address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // 原生ETH的特殊地址
		wrappedAddress: WETH_ADDRESS, // 通过环境变量注入 WETH 地址
		symbol: 'ETH',
		name: 'Ethereum',
		decimals: 18,
		isNative: true,
	},
	MNTokenA: {
		address: tokenA,
		symbol: 'MNA',
		name: 'MetaNode Token A',
		decimals: 18,
	},
	MNTokenB: {
		address: tokenB,
		symbol: 'MNB',
		name: 'MetaNode Token B',
		decimals: 18,
	},
	MNTokenC: {
		address: tokenC,
		symbol: 'MNC',
		name: 'MetaNode Token C',
		decimals: 18,
	},
	MNTokenD: {
		address: tokenD,
		symbol: 'MND',
		name: 'MetaNode Token D',
		decimals: 18,
	},
} as const;

// 费率选项
export const feeTiers = [500, 3000, 10000]; // 0.05%, 0.3%, 1%

// 合约地址配置
export const contracts = {
	POOL_MANAGER: '0x1a1a6d0ef39908aa8b8dd0b7052dc05b07b64735',
	POSITION_MANAGER: '0xa7e9e22cc2cfe5831e683b531ab636dca545acf5',
	SWAP_ROUTER: '0xbdc9b8f2ab20989198ab8f47fdbb2992f219726d',
	META_NODE_MANAGER: '0x8da623dcb3cd359d05682a2aac9bcb7a8eef3baf',
	LIQUIDITY_MANAGER: '0xa7e9e22cc2cfe5831e683b531ab636dca545acf5', // 使用Position Manager作为流动性管理器
} as const;

export function isNativeTokenAddress(address?: string | null): boolean {
	return !!address && address.toLowerCase() === tokens.ETH.address.toLowerCase();
}

export function toChainTokenAddress(address: string): string {
	return isNativeTokenAddress(address) ? (tokens.ETH.wrappedAddress as string) : address;
}

// 解析输入数量
export function parseInputAmount(input: string): string {
	// 移除非数字字符（除了小数点）
	const cleaned = input.replace(/[^0-9.]/g, '');

	// 确保只有一个小数点
	const parts = cleaned.split('.');
	if (parts.length > 2) {
		return parts[0] + '.' + parts.slice(1).join('');
	}

	return cleaned;
}

export function getTokenByAddress(address?: string | null) {
	if (!address) return undefined;

	return Object.values(tokens).find((token) => {
		if (token.address.toLowerCase() === address.toLowerCase()) {
			return true;
		}

		return (
			'wrappedAddress' in token &&
			typeof token.wrappedAddress === 'string' &&
			token.wrappedAddress.toLowerCase() === address.toLowerCase()
		);
	});
}

export const GAS_LIMIT_CAP = 16_000_000n;

export const getErrorMessage = (error: unknown) => {
	if (error instanceof BaseError) {
		return error.shortMessage || error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return '交易提交失败';
};
