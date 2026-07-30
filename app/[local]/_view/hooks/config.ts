import {
	createPublicClient,
	createWalletClient,
	http,
	webSocket,
	custom,
} from 'viem';
import { sepolia, mainnet, type Chain } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

// 支持的链配置
export const SUPPORTED_CHAINS = {
	sepolia,
	mainnet,
	// 可添加更多链
} as const;

export type SupportedChainId = keyof typeof SUPPORTED_CHAINS;

// 客户端配置
export const createClients = (chain: Chain = sepolia) => {
	const publicClient = createPublicClient({
		chain,
		transport: http(process.env.NEXT_PUBLIC_RPC_URL),
		batch: { multicall: true },
	});

	const walletClient = createWalletClient({
		chain,
		transport: custom(
			typeof window !== 'undefined' ? window.ethereum! : undefined
		),
	});

	return { publicClient, walletClient };
};

// 默认ABI示例 (ERC20)
export const ERC20_ABI = [
	{
		inputs: [{ name: 'owner', type: 'address' }],
		name: 'balanceOf',
		outputs: [{ name: '', type: 'uint256' }],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{ name: 'to', type: 'address' },
			{ name: 'amount', type: 'uint256' },
		],
		name: 'transfer',
		outputs: [{ name: '', type: 'bool' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{ name: 'from', type: 'address' },
			{ name: 'to', type: 'address' },
			{ name: 'amount', type: 'uint256' },
		],
		name: 'transferFrom',
		outputs: [{ name: '', type: 'bool' }],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		anonymous: false,
		inputs: [
			{ indexed: true, name: 'from', type: 'address' },
			{ indexed: true, name: 'to', type: 'address' },
			{ indexed: false, name: 'value', type: 'uint256' },
		],
		name: 'Transfer',
		type: 'event',
	},
] as const;
