'use client';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function ChangeTheme() {
	const t = useTranslations('changeTheme');
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<Button
			variant="destructive"
			onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
			className="px-3 py-1 text-sm rounded-md bg-foreground text-background font-medium"
		>
			{t(theme === 'dark' ? 'dark' : 'light')}
		</Button>
	);
}
