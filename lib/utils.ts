import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const sepoliaContractAddress = process.env.NEXT_PUBLIC_SOPOLIA_ADDRESS as `0x${string}`;

// alc
export const sepoliaNetUrl = process.env.NEXT_PUBLIC_RPC_URL;

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
