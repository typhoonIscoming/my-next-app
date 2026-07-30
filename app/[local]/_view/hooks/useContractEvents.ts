import { useEffect, useState, useCallback, useRef } from 'react';
import { type Address, type Abi } from 'viem';
import { useClients } from './useClients';

interface UseContractEventsOptions {
	address: Address;
	abi: Abi;
	eventName?: string;
	fromBlock?: bigint;
	toBlock?: bigint;
	args?: Record<string, any>;
	enabled?: boolean;
}

interface EventLog<T = any> {
	args: T;
	blockNumber: bigint;
	transactionHash: string;
	logIndex: number;
}

export const useContractEvents = <T = any>(
	options: UseContractEventsOptions
) => {
	const { publicClient } = useClients();
	const [events, setEvents] = useState<EventLog<T>[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const unwatchRef = useRef<(() => void) | null>(null);

	const {
		address,
		abi,
		eventName,
		fromBlock,
		toBlock,
		args = {},
		enabled = true,
	} = options;

	// 查询历史事件
	const getPastEvents = useCallback(async () => {
		if (!address || !enabled) return;

		setIsLoading(true);
		setError(null);

		try {
			const logs = await publicClient.getContractEvents({
				address,
				abi,
				eventName,
				fromBlock,
				toBlock,
				args,
			});

			setEvents(logs as EventLog<T>[]);
		} catch (err) {
			setError(err as Error);
		} finally {
			setIsLoading(false);
		}
	}, [
		address,
		abi,
		eventName,
		fromBlock,
		toBlock,
		args,
		publicClient,
		enabled,
	]);

	// 实时监听事件
	const startListening = useCallback(() => {
		if (!address || !enabled) return;

		// 停止之前的监听
		if (unwatchRef.current) {
			unwatchRef.current();
			unwatchRef.current = null;
		}

		const unwatch = publicClient.watchContractEvent({
			address,
			abi,
			eventName,
			args,
			onLogs: (logs: any[]) => {
				setEvents((prev) => [...prev, ...logs] as EventLog<T>[]);
			},
			onError: (err: Error) => {
				setError(err);
			},
		});

		unwatchRef.current = unwatch;
	}, [address, abi, eventName, args, publicClient, enabled]);

	// 停止监听
	const stopListening = useCallback(() => {
		if (unwatchRef.current) {
			unwatchRef.current();
			unwatchRef.current = null;
		}
	}, []);

	// 清空事件
	const clearEvents = useCallback(() => {
		setEvents([]);
	}, []);

	// 初始加载和历史查询
	useEffect(() => {
		if (enabled) {
			getPastEvents();
			startListening();
		}

		return () => {
			stopListening();
		};
	}, [enabled, getPastEvents, startListening, stopListening]);

	return {
		events,
		isLoading,
		error,
		getPastEvents,
		startListening,
		stopListening,
		clearEvents,
	};
};
