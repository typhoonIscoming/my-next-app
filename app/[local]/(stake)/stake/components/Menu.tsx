'use client';
import { useSelectedLayoutSegment } from 'next/navigation';
import { NavigationMenu, NavigationMenuItem } from '@/components/ui/navigation-menu';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Box from '@mui/material/Box';

const MenuList = [
	{ href: '/stake', label: 'stake' },
	{ href: '/withdraw', label: 'withdraw' },
	{ href: '/claim', label: 'claim' },
];

export default function Menu() {
	const activeSegment = useSelectedLayoutSegment();
	const t = useTranslations('stake');
	return (
		<NavigationMenu className="gap-4">
			{MenuList.map((item) => (
				<Box
					className={cn(
						'flex items-center justify-center w-20 pb-2',
						activeSegment === item.href.slice(1)
							? 'border-bottom-white border-white-500'
							: ''
					)}
					key={item.href}
				>
					<NavigationMenuItem
						key={item.href}
						className={cn(
							'bg-linear-to-r from-(--from-primary) to-(--to-primary) text-transparent bg-clip-text text-lg font-semibold',
							activeSegment === item.href.slice(1) ? 'text-blue-500' : ''
						)}
					>
						<Link href={item.href}>{t(item.label)}</Link>
					</NavigationMenuItem>
				</Box>
			))}
		</NavigationMenu>
	);
}
