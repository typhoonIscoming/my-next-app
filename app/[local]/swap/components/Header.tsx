'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import CustomConnectButton from '@/app/components/CustomConnectButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import SvgIcon from '@mui/material/SvgIcon';
import PoolSvg from '@/app/assets/svgs/pool-water-swimming-svgrepo-com.svg';
import Portfolio from '@/public/portfolio-svgrepo-com.svg';
import { styled } from '@mui/material/styles';

const StyledDrawer = styled(Drawer)({
	'.MuiPaper-root': {
		backgroundColor: 'transparent',
	},
});

export default function Header() {
	const pathname = usePathname() || '/';
	const router = useRouter();
	const locale = useLocale() as 'zh' | 'en';
	const t = useTranslations();
	const [state, setState] = useState(false);
	const toggleDrawer = (open: boolean) => {
		setState(open);
	};

	const normalizedPath = pathname.replace(new RegExp(`^/${locale}`), '') || '/';
	const isSwap =
		normalizedPath === '/swap' ||
		(normalizedPath.startsWith('/swap/') &&
			!normalizedPath.startsWith('/swap/pool') &&
			!normalizedPath.startsWith('/swap/position'));
	const isPool = normalizedPath.startsWith('/swap/pool');
	const isPosition = normalizedPath.startsWith('/swap/position');

	const navItemClass = (active: boolean) =>
		[
			'px-3 py-2 transition',
			active
				? 'rounded-full bg-white/5 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
				: 'text-zinc-400 hover:text-white',
		].join(' ');

	const handleLocaleChange = (nextLocale: 'zh' | 'en') => {
		if (nextLocale === locale) return;
		router.replace(pathname, { locale: nextLocale });
	};

	return (
		<>
			<header className="sticky top-0 z-999 border-b border-white/10 bg-[#131313]/70 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl supports-[backdrop-filter]:bg-[#131313]/60">
				<div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#b0a3ff,#5a5cff_40%,#1e1f5e_70%,#110d2c)] shadow-[0_0_30px_rgba(138,109,255,0.6)]">
							<span className="text-sm font-black tracking-[-0.08em]">M</span>
						</div>
						<div className="hidden md:block text-xl font-semibold tracking-[-0.06em]">
							MetaNodeSwap
						</div>
						<div className="md:hidden" onClick={() => setState(true)}>
							<MenuIcon className="text-white" />
						</div>
					</div>

					<nav className="hidden items-center gap-8 text-sm font-medium text-zinc-300 md:flex">
						<Link href="/swap" className={navItemClass(isSwap)}>
							{t('swap.navSwap')}
						</Link>
						<Link href="/swap/pool" className={navItemClass(isPool)}>
							{t('swap.navPool')}
						</Link>
						<Link href="/swap/position" className={navItemClass(isPosition)}>
							{t('swap.navPosition')}
						</Link>
					</nav>

					<div className="flex items-center gap-3">
						<div className="flex items-center rounded-full border border-white/10 bg-white/3 p-1 text-xs font-medium text-zinc-200">
							<button
								type="button"
								onClick={() => handleLocaleChange('zh')}
								className={`rounded-full cursor-pointer px-2.5 py-1.5 transition ${locale === 'zh' ? 'bg-white text-[#0a0d17]' : 'text-zinc-300'}`}
							>
								{t('LanguageSwitcher.zh')}
							</button>
							<button
								type="button"
								onClick={() => handleLocaleChange('en')}
								className={`rounded-full cursor-pointer px-2.5 py-1.5 transition ${locale === 'en' ? 'bg-white text-[#0a0d17]' : 'text-zinc-300'}`}
							>
								{t('LanguageSwitcher.en')}
							</button>
						</div>

						<CustomConnectButton>
							{({
								connected,
								chain,
								account,
								openAccountModal,
								openConnectModal,
							}) => {
								const shortAddress = account
									? `${account.address.slice(0, 4)}...${account.address.slice(-4)}`
									: '';
								return !connected ? (
									<Button
										onClick={openConnectModal}
										className="rounded-2xl! text-white! hover:text-(--swap-hover-background)! bg-(--swap-background)!"
									>
										{t('swap.connectWallet')}
									</Button>
								) : (
									<Button onClick={openAccountModal} className="text-white!">
										{shortAddress}
									</Button>
								);
							}}
						</CustomConnectButton>
					</div>
				</div>
			</header>
			<StyledDrawer anchor={'bottom'} open={state} onClose={() => toggleDrawer(false)}>
				<div
					className="h-full w-full bg-[#131313] text-white pb-8 rounded-t-2xl"
					role="presentation"
					onClick={() => toggleDrawer(false)}
					onKeyDown={() => toggleDrawer(false)}
				>
					<List>
						<ListItem className="gap-4">
							<InsertLinkIcon />
							<Link href="/swap">{t('swap.navSwap')}</Link>
						</ListItem>
						<ListItem className="gap-4">
							<SvgIcon component={PoolSvg} inheritViewBox />
							<Link href="/swap/pool">{t('swap.navPool')}</Link>
						</ListItem>
						<ListItem className="gap-4">
							<SvgIcon component={Portfolio} inheritViewBox />
							<Link href="/swap/position">{t('swap.navPosition')}</Link>
						</ListItem>
					</List>
				</div>
			</StyledDrawer>
		</>
	);
}
