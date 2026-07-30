import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const sepoliaContractAddress = process.env.NEXT_PUBLIC_SOPOLIA_ADDRESS as `0x${string}`;

// alc
export const sepoliaNetUrl = process.env.NEXT_PUBLIC_RPC_URL;
