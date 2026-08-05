'use client';
import { useCallback, useTransition } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';

type Language = 'en' | 'zh';

type UseChangeLanguageOptions = {
	local: Language;
};

export default function useChangeLanguage({ local }: UseChangeLanguageOptions) {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	const pathname = usePathname();

	const currentLanguage: Language = local === 'en' ? 'en' : 'zh';
	const otherLanguage: Language = currentLanguage === 'en' ? 'zh' : 'en';

	const changeLanguage = useCallback(
		(nextLocale: Language = otherLanguage) => {
			if (!pathname || nextLocale === currentLanguage) return;
			startTransition(() => {
				router.replace(pathname, { locale: nextLocale });
			});
		},
		[currentLanguage, otherLanguage, pathname, router]
	);

	const toggleLanguage = useCallback(() => {
		changeLanguage();
	}, [changeLanguage]);

	return {
		currentLanguage,
		otherLanguage,
		changeLanguage,
		toggleLanguage,
		isPending,
	};
}
