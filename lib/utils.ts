import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { type Address } from 'viem';

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
