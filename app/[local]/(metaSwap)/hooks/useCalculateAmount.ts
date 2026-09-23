import { useState, useCallback } from 'react';

export default function useCalculateAmount({
	poolExists,
	currentPool,
	token0,
	token1,
	initialPrice,
}: {
	poolExists: boolean;
	currentPool: string | null;
	token0: any;
	token1: any;
	initialPrice: string;
}) {
	const [priceError, setPriceError] = useState<string | null>(null);
	const [amount0, setAmount0] = useState('');
	const [amount1, setAmount1] = useState('');
	const [isCalculating, setIsCalculating] = useState(false);

	const calculateAmount = useCallback(
		async (inputToken: 'token0' | 'token1', amount: string) => {
			if (!amount || parseFloat(amount) === 0) {
				if (inputToken === 'token0') {
					setAmount1('');
				} else {
					setAmount0('');
				}
				setPriceError(null);
				return;
			}
			setIsCalculating(true);
			setPriceError(null);

			try {
				if (poolExists && currentPool && token0 && token1) {
					// 如果池子存在，使用池子价格计算
					const response = await fetch('/api/pools/price', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							poolAddress: currentPool,
							inputToken: inputToken === 'token0' ? token0.address : token1.address,
							inputAmount: amount,
						}),
					});

					const data = await response.json();

					if (!response.ok || !data.success) {
						const errorMsg = data.msg || data.error || '计算价格失败';
						setPriceError(errorMsg);
						// 如果计算失败，清空对应的输出金额
						if (inputToken === 'token0') {
							setAmount1('');
						} else {
							setAmount0('');
						}
						return;
					}

					// 成功计算
					if (inputToken === 'token0') {
						setAmount1(data.outputAmount);
					} else {
						setAmount0(data.outputAmount);
					}
					setPriceError(null);
				} else {
					// 如果池子不存在，使用初始价格比率计算
					const priceRatio = parseFloat(initialPrice);
					if (priceRatio > 0 && isFinite(priceRatio)) {
						try {
							if (inputToken === 'token0') {
								const calculated = parseFloat(amount) * priceRatio;
								setAmount1(isNaN(calculated) ? '' : calculated.toString());
							} else {
								const calculated = parseFloat(amount) / priceRatio;
								setAmount0(isNaN(calculated) ? '' : calculated.toString());
							}
							setPriceError(null);
						} catch (calcError) {
							console.error('价格计算错误:', calcError);
							setPriceError('价格计算失败，请检查输入');
							if (inputToken === 'token0') {
								setAmount1('');
							} else {
								setAmount0('');
							}
						}
					} else {
						// 默认 1:1
						if (inputToken === 'token0') {
							setAmount1(amount);
						} else {
							setAmount0(amount);
						}
						setPriceError(null);
					}
				}
			} catch (error) {
				console.error('计算数量失败:', error);
				const errorMsg = error instanceof Error ? error.message : '计算价格失败';
				setPriceError(errorMsg);
				// 清空对应的输出金额
				if (inputToken === 'token0') {
					setAmount1('');
				} else {
					setAmount0('');
				}
			} finally {
				setIsCalculating(false);
			}
		},
		[poolExists, currentPool, token0, token1, initialPrice]
	);

	return {
		priceError,
		calculateAmount,
		amount0,
		amount1,
		isCalculating,
	};
}
