import { useMemo, useCallback, useState } from 'react';
import { tokens, toChainTokenAddress } from '@/lib/utils';
import usePools from './usePools';
import type { Token } from '../../liquidity/types';

const ETH_ADDRESS_LOWER = tokens.ETH.address.toLowerCase();
const WETH_ADDRESS_LOWER = (tokens.ETH.wrappedAddress as string).toLowerCase();
const LEGACY_WETH_ADDRESS_LOWER = '0xfff9976782d46cc05630d1f6ebab18b2324d6b14';
const WRAPPED_ETH_ALIASES = new Set<string>([WETH_ADDRESS_LOWER, LEGACY_WETH_ADDRESS_LOWER]);

const ETH_TOKEN: Token = {
	address: tokens.ETH.address,
	symbol: tokens.ETH.symbol,
	name: tokens.ETH.name,
	decimals: tokens.ETH.decimals,
	supportsPermit: false,
};

const FALLBACK_TOKEN_LIST: Token[] = [
	ETH_TOKEN,
	...Object.values(tokens)
		.filter((token) => !('isNative' in token && token.isNative))
		.map((token) => ({
			address: token.address,
			symbol: token.symbol,
			name: token.name,
			decimals: token.decimals,
			supportsPermit: false,
		})),
];

export default function useGetTokenOptions(toToken: Token) {
	const { pools } = usePools();
	const [tokenList, setTokenList] = useState<Token[]>(FALLBACK_TOKEN_LIST);
	const poolAdjacency = useMemo(() => {
		const adjacency = new Map<string, Set<string>>();

		const addEdge = (a: string, b: string) => {
			const keyA = a.toLowerCase();
			const keyB = b.toLowerCase();
			if (!adjacency.has(keyA)) adjacency.set(keyA, new Set());
			adjacency.get(keyA)!.add(keyB);
		};

		for (const pool of pools) {
			addEdge(pool.token0, pool.token1);
			addEdge(pool.token1, pool.token0);
		}
		return adjacency;
	}, [pools]);
	const toComparableAddress = useCallback((tokenAddress: string) => {
		const normalized = tokenAddress.toLowerCase();
		if (normalized === ETH_ADDRESS_LOWER || WRAPPED_ETH_ALIASES.has(normalized)) {
			return WETH_ADDRESS_LOWER;
		}
		return toChainTokenAddress(tokenAddress).toLowerCase();
	}, []);
	const expandAddressAlias = useCallback((tokenAddress: string) => {
		const normalized = tokenAddress.toLowerCase();
		if (normalized === ETH_ADDRESS_LOWER || WRAPPED_ETH_ALIASES.has(normalized)) {
			return [ETH_ADDRESS_LOWER, ...Array.from(WRAPPED_ETH_ALIASES)];
		}
		return [normalized];
	}, []);
	const getLinkedTokenOptions = useCallback(
		(baseTokenAddress: string, fallbackExcludeAddress?: string): Token[] => {
			const baseAliases = expandAddressAlias(baseTokenAddress);
			const linked = new Set<string>();
			for (const alias of baseAliases) {
				for (const next of poolAdjacency.get(alias) ?? []) {
					linked.add(next);
					for (const nextAlias of expandAddressAlias(next)) {
						linked.add(nextAlias);
					}
				}
			}

			const excludeComparable = fallbackExcludeAddress
				? toComparableAddress(fallbackExcludeAddress)
				: undefined;

			if (!linked || linked.size === 0) {
				return tokenList.filter(
					(token) => toComparableAddress(token.address) !== excludeComparable
				);
			}

			return tokenList.filter((token) => {
				if (toComparableAddress(token.address) === excludeComparable) return false;
				return expandAddressAlias(token.address).some((alias) => linked.has(alias));
			});
		},
		[poolAdjacency, tokenList, expandAddressAlias, toComparableAddress]
	);

	const fromTokenOptions = useMemo(() => {
		return getLinkedTokenOptions(toToken.address, toToken.address);
	}, [toToken, getLinkedTokenOptions]);
	return { fromTokenOptions };
}
