import { useCallback } from 'react';
import { usePublicClient, useAccount, useSignTypedData } from 'wagmi';
import { encodeFunctionData, parseSignature } from 'viem';
import { contractConfig, ERC20_ABI, ERC20_PERMIT_ABI } from '@/lib/metaAbi';
import { contracts } from '@/lib/utils';

const EIP712_VERSION_ABI = [
	{
		type: 'function',
		name: 'version',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ name: '', type: 'string' }],
	},
] as const;

export default function useBuildPermitCalldata({ chainId }: { chainId: number | null }) {
	const { address } = useAccount();
	const publicClient = usePublicClient();
	const { signTypedDataAsync } = useSignTypedData();

	return useCallback(
		async ({
			tokenAddress,
			tokenName,
			value,
			deadline,
		}: {
			tokenAddress: `0x${string}`;
			tokenName: string;
			value: bigint;
			deadline: bigint;
		}): Promise<`0x${string}`> => {
			if (!address || !publicClient) {
				throw new Error('钱包未连接');
			}
			// 优先使用链上 name()/version() 作为 EIP-712 domain，避免前端缓存名称与合约不一致导致签名无效
			let domainName = tokenName;
			let domainVersion = '1';
			try {
				const onchainName = await publicClient.readContract({
					address: tokenAddress,
					abi: ERC20_ABI,
					functionName: 'name',
				});
				if (typeof onchainName === 'string' && onchainName.trim().length > 0) {
					domainName = onchainName;
				}
			} catch {
				// keep fallback tokenName
			}
			try {
				const onchainVersion = await publicClient.readContract({
					address: tokenAddress,
					abi: EIP712_VERSION_ABI,
					functionName: 'version',
				});
				if (typeof onchainVersion === 'string' && onchainVersion.trim().length > 0) {
					domainVersion = onchainVersion;
				}
			} catch {
				// most ERC20Permit tokens do not expose version(), keep "1"
			}

			const nonce = await publicClient.readContract({
				address: tokenAddress,
				abi: ERC20_PERMIT_ABI,
				functionName: 'nonces',
				args: [address],
			});

			const signature = await signTypedDataAsync({
				account: address,
				domain: {
					name: domainName,
					version: domainVersion,
					chainId: publicClient.chain?.id ?? chainId,
					verifyingContract: tokenAddress,
				},
				types: {
					Permit: [
						{ name: 'owner', type: 'address' },
						{ name: 'spender', type: 'address' },
						{ name: 'value', type: 'uint256' },
						{ name: 'nonce', type: 'uint256' },
						{ name: 'deadline', type: 'uint256' },
					],
				},
				primaryType: 'Permit',
				message: {
					owner: address,
					spender: contracts.META_NODE_MANAGER as `0x${string}`,
					value,
					nonce,
					deadline,
				},
			});
			const parsed = parseSignature(signature);
			const permitV = Number(parsed.v ?? (parsed.yParity === 0 ? 27 : 28));
			const { r, s } = parsed;
			// 把「调用某个合约函数」的意图，编码成 EVM 能识别的 calldata（十六进制数据）
			return encodeFunctionData({
				abi: contractConfig.metaNodeManager.abi,
				functionName: 'selfPermitIfNecessary',
				args: [tokenAddress, value, deadline, permitV, r, s],
			});
		},
		[address, publicClient, chainId, signTypedDataAsync]
	);
}
