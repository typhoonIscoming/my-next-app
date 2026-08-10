'use client';
import { useState } from 'react';
// 泛型版本 - 最灵活
interface GenericChildFunctionProps<T> {
	children: (params: T) => React.ReactNode;
	initialData?: T;
}

export default function GenericComponent<T extends Record<string, any>>({
	children,
	initialData,
}: GenericChildFunctionProps<T>) {
	const [data, setData] = useState<T>(initialData || ({} as T));

	return children({
		...data,
		setData,
		updateData: (newData: Partial<T>) => setData((prev) => ({ ...prev, ...newData })),
	});
}
