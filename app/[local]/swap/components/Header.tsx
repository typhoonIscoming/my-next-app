'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';

export default function Header() {
	const pathname = usePathname() || '/';
	const router = useRouter();
	const locale = useLocale() as 'zh' | 'en';
	const t = useTranslations('swap');

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
		<header className="flex items-center justify-between rounded-[28px] border border-white/10 bg-white/2 px-4 py-3 shadow-[0_20px_80px_rgba(19,41,84,0.35)] backdrop-blur-xl sm:px-6">
			<div className="flex items-center gap-3">
				<div className="flex h-9 w-9 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#b0a3ff,#5a5cff_40%,#1e1f5e_70%,#110d2c)] shadow-[0_0_30px_rgba(138,109,255,0.6)]">
					<span className="text-sm font-black tracking-[-0.08em]">M</span>
				</div>
				<div className="text-xl font-semibold tracking-[-0.06em]">MetaNodeSwap</div>
			</div>

			<nav className="hidden items-center gap-8 text-sm font-medium text-zinc-300 md:flex">
				<Link href="/swap" className={navItemClass(isSwap)}>
					{t('navSwap')}
				</Link>
				<Link href="/swap/pool" className={navItemClass(isPool)}>
					{t('navPool')}
				</Link>
				<Link href="/swap/position" className={navItemClass(isPosition)}>
					{t('navPosition')}
				</Link>
			</nav>

			<div className="flex items-center gap-3">
				<div className="flex items-center rounded-full border border-white/10 bg-white/3 p-1 text-xs font-medium text-zinc-200">
					<button
						type="button"
						onClick={() => handleLocaleChange('zh')}
						className={`rounded-full cursor-pointer px-2.5 py-1.5 transition ${locale === 'zh' ? 'bg-white text-[#0a0d17]' : 'text-zinc-300'}`}
					>
						中文
					</button>
					<button
						type="button"
						onClick={() => handleLocaleChange('en')}
						className={`rounded-full cursor-pointer px-2.5 py-1.5 transition ${locale === 'en' ? 'bg-white text-[#0a0d17]' : 'text-zinc-300'}`}
					>
						EN
					</button>
				</div>

				<button className="hidden rounded-full border border-white/10 bg-white/3 px-3 py-2 text-sm text-zinc-200 md:inline-flex">
					{t('network')}
				</button>
				<button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a0d17] shadow-[0_10px_30px_rgba(255,255,255,0.15)] transition hover:scale-[1.01]">
					{t('connectWallet')}
				</button>
			</div>
		</header>
	);
}
