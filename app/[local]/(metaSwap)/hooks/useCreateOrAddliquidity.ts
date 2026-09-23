import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import { parseUnits, encodeFunctionData } from 'viem';
import { toChainTokenAddress, isNativeTokenAddress, contracts, getErrorMessage } from '@/lib/utils';
import { contractConfig } from '@/lib/metaAbi';
import type { Token, TransactionAction } from '../liquidity/types';
import useBalanceAndAllowance from './useBalanceAndAllowance';
import useBuildPermitCalldata from './useBuildPermitCalldata';
import useWriteMulticall from './usewriteMulticall';

const calculateSqrtPriceX96 = (price: string): bigint => {
	try {
		const priceRatio = parseFloat(price);
		if (priceRatio <= 0 || !isFinite(priceRatio)) {
			return BigInt(0);
		}

		// sqrtPriceX96 = sqrt(price) * 2^96
		// price = reserve1 / reserve0
		// 使用简化的计算方式
		const Q96 = BigInt(2) ** BigInt(96);
		const sqrtPrice = Math.sqrt(priceRatio);
		return BigInt(Math.floor(sqrtPrice * Number(Q96)));
	} catch {
		return BigInt(0);
	}
};

export default function useCreateOrAddliquidity({
	amount0,
	amount1,
	token0,
	token1,
	selectedFee,
	initialPrice,
	token0SupportsPermit,
	token1SupportsPermit,
	chainId,
	enablePermitLiquidity,
}: {
	amount0: string;
	amount1: string;
	token0: Token | null;
	token1: Token | null;
	selectedFee: number;
	initialPrice: string;
	token0SupportsPermit: boolean;
	token1SupportsPermit: boolean;
	chainId: number | null;
	enablePermitLiquidity: boolean;
}) {
	const { address } = useAccount();
	const assertBalanceAndAllowance = useBalanceAndAllowance();
	const buildPermitCalldata = useBuildPermitCalldata({ chainId });
	const [transactionError, setTransactionError] = useState<string | null>(null);
	const [action, setTransactionAction] = useState<TransactionAction | null>(null);
	const [priceError, setPriceError] = useState<string | null>(null);
	const writeMetaNodeManagerMulticall = useWriteMulticall();

	const createPoolAndAddLiquidity = useCallback(async () => {
		if (!address || !amount0 || !amount1 || !token0 || !token1) return;
		try {
			const amountWei0 = parseUnits(amount0, token0.decimals);
			const amountWei1 = parseUnits(amount1, token1.decimals);
			const actualToken0Address = toChainTokenAddress(token0.address);
			const actualToken1Address = toChainTokenAddress(token1.address);

			// 确保 token0 地址小于 token1 地址，并同步对应 metadata（name/permit）
			let sortedToken0Address = actualToken0Address;
			let sortedToken1Address = actualToken1Address;
			let sortedAmount0 = amountWei0;
			let sortedAmount1 = amountWei1;
			let sortedToken0Name = token0.name;
			let sortedToken1Name = token1.name;
			let sortedToken0SupportsPermit = token0SupportsPermit;
			let sortedToken1SupportsPermit = token1SupportsPermit;

			if (BigInt(actualToken0Address) > BigInt(actualToken1Address)) {
				sortedToken0Address = actualToken1Address;
				sortedToken1Address = actualToken0Address;
				sortedAmount0 = amountWei1;
				sortedAmount1 = amountWei0;
				sortedToken0Name = token1.name;
				sortedToken1Name = token0.name;
				sortedToken0SupportsPermit = token1SupportsPermit;
				sortedToken1SupportsPermit = token0SupportsPermit;
			}
			const sortedToken0Decimals =
				BigInt(actualToken0Address) > BigInt(actualToken1Address)
					? token1.decimals
					: token0.decimals;
			const sortedToken1Decimals =
				BigInt(actualToken0Address) > BigInt(actualToken1Address)
					? token0.decimals
					: token1.decimals;
			await assertBalanceAndAllowance({
				tokenAddress: sortedToken0Address as `0x${string}`,
				amountRequired: sortedAmount0,
				tokenSymbol: sortedToken0Name,
				tokenDecimals: sortedToken0Decimals,
			});
			await assertBalanceAndAllowance({
				tokenAddress: sortedToken1Address as `0x${string}`,
				amountRequired: sortedAmount1,
				tokenSymbol: sortedToken1Name,
				tokenDecimals: sortedToken1Decimals,
			});
			const priceRatio = parseFloat(initialPrice);
			if (priceRatio <= 0 || !isFinite(priceRatio)) {
				setPriceError('请输入有效的价格比率');
				return;
			}
			const actualPrice =
				BigInt(actualToken0Address) < BigInt(actualToken1Address)
					? priceRatio
					: 1 / priceRatio;

			const sqrtPriceX96 = calculateSqrtPriceX96(actualPrice.toString());
			if (sqrtPriceX96 === BigInt(0)) {
				setPriceError('价格计算失败，请检查输入');
				return;
			}
			setPriceError(null);

			const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
			const multicallData: `0x${string}`[] = [];

			if (
				enablePermitLiquidity &&
				sortedToken0SupportsPermit &&
				!isNativeTokenAddress(sortedToken0Address)
			) {
				multicallData.push(
					await buildPermitCalldata({
						tokenAddress: sortedToken0Address as `0x${string}`,
						tokenName: sortedToken0Name,
						value: sortedAmount0,
						deadline,
					})
				);
			}

			if (
				enablePermitLiquidity &&
				sortedToken1SupportsPermit &&
				!isNativeTokenAddress(sortedToken1Address)
			) {
				multicallData.push(
					await buildPermitCalldata({
						tokenAddress: sortedToken1Address as `0x${string}`,
						tokenName: sortedToken1Name,
						value: sortedAmount1,
						deadline,
					})
				);
			}

			const createAndAddLiquidityCalldata = encodeFunctionData({
				abi: contractConfig.metaNodeManager.abi,
				functionName: 'createAndAddLiquidity',
				args: [
					{
						token0: sortedToken0Address as `0x${string}`,
						token1: sortedToken1Address as `0x${string}`,
						fee: selectedFee,
						tickLower: -887272,
						tickUpper: 887272,
						sqrtPriceX96,
					},
					{
						token0: sortedToken0Address as `0x${string}`,
						token1: sortedToken1Address as `0x${string}`,
						index: 0,
						amount0Desired: sortedAmount0,
						amount1Desired: sortedAmount1,
						recipient: address,
						deadline,
					},
				],
			});
			multicallData.push(createAndAddLiquidityCalldata);

			// 通过 MetaNodeManager.multicall 一笔完成「permit(可选) + 创建池子 + 添加流动性」
			setTransactionAction('createPool');
			setTransactionError(null);
			await writeMetaNodeManagerMulticall({
				calldatas: multicallData,
				contractAddress: contracts.META_NODE_MANAGER,
				abi: contractConfig.metaNodeManager.abi,
				args: [multicallData],
			});
		} catch (error) {
			setTransactionAction(null);
			setPriceError(getErrorMessage(error));
			return;
		}
	}, [
		address,
		amount0,
		amount1,
		token0,
		token1,
		selectedFee,
		initialPrice,
		token0SupportsPermit,
		token1SupportsPermit,
	]);

	return {
		createPoolAndAddLiquidity,
		action,
		priceError,
		transactionError,
	};
}
