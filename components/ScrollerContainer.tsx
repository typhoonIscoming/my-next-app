'use client';

import { ReactNode } from 'react';
import styles from './ScrollableContainer.module.css';

interface ScrollableContainerProps {
	children: ReactNode;
	maxHeight?: string | number;
	className?: string;
}

export default function ScrollableContainer({
	children,
	maxHeight = '400px',
	className = '',
}: ScrollableContainerProps) {
	return (
		<div className={`${styles.container} ${className}`} style={{ maxHeight }}>
			{children}
		</div>
	);
}
