import { useState, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import type { ContractConfig, TransactionState } from './type';

export function useContract(
	config: ContractConfig | null,
	signerOrProvider?: ethers.Signer | ethers.Provider
) {
	const [transaction, setTransaction] = useState<TransactionState>({
		isLoading: false,
	});

	// 创建合约实例
	const contract = useMemo(() => {
		if (!config || !signerOrProvider) return null;

		try {
			return new ethers.Contract(
				config.address,
				config.abi,
				signerOrProvider
			);
		} catch (err) {
			console.error('创建合约实例失败:', err);
			return null;
		}
	}, [config, signerOrProvider]);

	// 读取方法（view/pure）
	const read = useCallback(
		async <T = any>(methodName: string, args: any[] = []): Promise<T> => {
			if (!contract) {
				throw new Error('合约未初始化');
			}

			try {
				const result = await contract[methodName](...args);
				return result as T;
			} catch (err) {
				console.error(`读取 ${methodName} 失败:`, err);
				throw err;
			}
		},
		[contract]
	);

	// 批量读取
	const readMultiple = useCallback(
		async <T extends Record<string, any>>(
			methods: Array<{ name: string; args?: any[] }>
		): Promise<T> => {
			if (!contract) {
				throw new Error('合约未初始化');
			}

			try {
				const promises = methods.map(({ name, args = [] }) =>
					contract[name](...args)
				);
				const results = await Promise.all(promises);

				return methods.reduce(
					(acc, { name }, index) => ({
						...acc,
						[name]: results[index],
					}),
					{} as T
				);
			} catch (err) {
				console.error('批量读取失败:', err);
				throw err;
			}
		},
		[contract]
	);

	// 写入方法（交易）
	const write = useCallback(
		async <T = any>(
			methodName: string,
			args: any[] = [],
			options: ethers.Overrides = {}
		): Promise<ethers.TransactionResponse> => {
			if (!contract) {
				throw new Error('合约未初始化');
			}

			// 检查是否有 signer（需要签名）
			if (!(contract.runner instanceof ethers.JsonRpcSigner)) {
				throw new Error('需要 Signer 来执行写操作');
			}

			setTransaction({ isLoading: true });

			try {
				const tx = await contract[methodName](...args, options);
				setTransaction((prev) => ({
					...prev,
					hash: tx.hash,
					isLoading: true,
				}));

				return tx;
			} catch (err: any) {
				setTransaction((prev) => ({
					...prev,
					isLoading: false,
					error: err,
				}));
				throw err;
			}
		},
		[contract]
	);

	// 发送交易并等待确认
	const writeAndWait = useCallback(
		async <T = any>(
			methodName: string,
			args: any[] = [],
			options: ethers.Overrides = {},
			confirmations: number = 1
		): Promise<{
			receipt: ethers.TransactionReceipt;
			result?: T;
		}> => {
			const tx = await write(methodName, args, options);

			try {
				const receipt = await tx.wait(confirmations);

				setTransaction({
					isLoading: false,
					hash: receipt?.hash,
					receipt: receipt || undefined,
				});

				// 如果有事件，尝试解析返回值
				if (receipt && receipt.status === 1) {
					// 这里可以解析事件日志
				}

				return { receipt: receipt! };
			} catch (err: any) {
				setTransaction((prev) => ({
					...prev,
					isLoading: false,
					error: err,
				}));
				throw err;
			}
		},
		[write]
	);

	// 监听事件
	const listenEvent = useCallback(
		(
			eventName: string,
			callback: (...args: any[]) => void,
			options?: { once?: boolean }
		) => {
			if (!contract) {
				throw new Error('合约未初始化');
			}

			const listener = options?.once ? 'once' : 'on';
			contract[listener](eventName, callback);

			// 返回取消监听的函数
			return () => {
				contract.off(eventName, callback);
			};
		},
		[contract]
	);

	// 查询历史事件
	const queryEvents = useCallback(
		async (
			eventName: string,
			fromBlock: number | string = 'earliest',
			toBlock: number | string = 'latest'
		) => {
			if (!contract) {
				throw new Error('合约未初始化');
			}

			try {
				const filter = contract.filters[eventName];
				if (!filter) {
					throw new Error(`事件 ${eventName} 不存在`);
				}

				const events = await contract.queryFilter(
					filter,
					fromBlock,
					toBlock
				);
				return events;
			} catch (err) {
				console.error(`查询 ${eventName} 事件失败:`, err);
				throw err;
			}
		},
		[contract]
	);

	// 重置交易状态
	const resetTransactionState = useCallback(() => {
		setTransaction({ isLoading: false });
	}, []);

	return {
		contract,
		transaction,
		read,
		readMultiple,
		write,
		writeAndWait,
		listenEvent,
		queryEvents,
		resetTransactionState,
		isReady: !!contract,
		isWriteable:
			!!contract && contract.runner instanceof ethers.JsonRpcSigner,
	};
}
